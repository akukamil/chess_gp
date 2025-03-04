let M_WIDTH=800, M_HEIGHT=450,app, assets={}, objects={}, state="",my_role="",client_id, game_tick=0, my_turn=false, room_name = '', game_id=0, connected = 1, LANG = 0,git_src,some_process = {}, h_state=0, game_platform='', hidden_state_start = 0, WIN = 1, DRAW = 0, LOSE = -1, NOSYNC = 2,no_invite=false, g_board=[], pending_player='', opponent=null, my_data={opp_id : ''}, opp_data={}, game_name='chess';
const op_pieces = ['p','r','n','b','k','q'];
const my_pieces = ['P','R','N','B','K','Q'];

var stockfish = new Worker('stockfish.js');
const chess = new Chess();

my_log={
	log_arr:[],
	add(data){		
		this.log_arr.push(data);
		if (this.log_arr.length>80)
			this.log_arr.shift();
	}	
};

THEME_DATA={
	0:{name:'def',rating:0,games:0},
	1:{name:'fabric',rating:1450,games:500},
	2:{name:'water',rating:1500,games:1000},
	3:{name:'ice',rating:1700,games:3000},
	4:{name:'metal',rating:1900,games:5000},
	5:{name:'wood',rating:2200,games:10000},
}

irnd = function (min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

fbs_once=async function(path){
	const info=await fbs.ref(path).once('value');
	return info.val();	
}

class player_mini_card_class extends PIXI.Container {

	constructor(x,y,id) {
		super();
		this.visible=false;
		this.id=id;
		this.uid=0;
		this.type = 'single';
		this.x=x;
		this.y=y;
		
		
		this.bcg=new PIXI.Sprite(assets.mini_player_card);
		this.bcg.width=200;
		this.bcg.height=90;
		this.bcg.interactive=true;
		this.bcg.buttonMode=true;
		this.bcg.pointerdown=function(){lobby.card_down(id)};
		
		this.table_rating_hl=new PIXI.Sprite(assets.table_rating_hl);
		this.table_rating_hl.width=200;
		this.table_rating_hl.height=90;
		
		this.avatar=new PIXI.Graphics();
		this.avatar.x=16;
		this.avatar.y=16;
		this.avatar.w=this.avatar.h=58.2;
		
		this.avatar_frame=new PIXI.Sprite(assets.circle_frame50);
		this.avatar_frame.x=16-11.64;
		this.avatar_frame.y=16-11.64;
		this.avatar_frame.width=this.avatar_frame.height=81.48;
				
		this.name="";
		this.name_text=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 22,align: 'center'});
		this.name_text.anchor.set(1,0);
		this.name_text.x=180;
		this.name_text.y=20;
		this.name_text.tint=0xffffff;		

		this.rating=0;
		this.rating_text=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 30,align: 'center'});
		this.rating_text.tint=0xffff00;
		this.rating_text.anchor.set(1,0.5);
		this.rating_text.x=180;
		this.rating_text.y=60;		
		this.rating_text.tint=0xffff00;

		//аватар первого игрока
		this.avatar1=new PIXI.Graphics();
		this.avatar1.x=19;
		this.avatar1.y=16;
		this.avatar1.w=this.avatar1.h=58.2;
		
		this.avatar1_frame=new PIXI.Sprite(assets.circle_frame50);
		this.avatar1_frame.x=this.avatar1.x-11.64;
		this.avatar1_frame.y=this.avatar1.y-11.64;
		this.avatar1_frame.width=this.avatar1_frame.height=81.48;

		//аватар второго игрока
		this.avatar2=new PIXI.Graphics();
		this.avatar2.x=121;
		this.avatar2.y=16;
		this.avatar2.w=this.avatar2.h=58.2;
		
		this.avatar2_frame=new PIXI.Sprite(assets.circle_frame50);
		this.avatar2_frame.x=this.avatar2.x-11.64;
		this.avatar2_frame.y=this.avatar2.y-11.64;
		this.avatar2_frame.width=this.avatar2_frame.height=81.48;
		
		
		this.rating_text1=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 24,align: 'center'});
		this.rating_text1.tint=0xffff00;
		this.rating_text1.anchor.set(0.5,0);
		this.rating_text1.x=48.1;
		this.rating_text1.y=56;

		this.rating_text2=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 24,align: 'center'});
		this.rating_text2.tint=0xffff00;
		this.rating_text2.anchor.set(0.5,0);
		this.rating_text2.x=150.1;
		this.rating_text2.y=56;		
		
		this.t_country=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.t_country.tint=0xffff00;
		this.t_country.anchor.set(1,0.5);
		this.t_country.x=100;
		this.t_country.y=60;		
		this.t_country.tint=0xaaaa99;
		
		this.name1="";
		this.name2="";

		this.addChild(this.bcg,this.avatar,this.avatar_frame,this.avatar1, this.avatar1_frame, this.avatar2,this.avatar2_frame,this.rating_text,this.table_rating_hl,this.rating_text1,this.rating_text2, this.name_text,this.t_country);
	}

}

class puzzle_leader_class extends PIXI.Container{
	
	constructor(x,y,id) {
		super();
		this.avatar=new PIXI.Graphics();
		this.avatar.w=this.avatar.h=60;
		
		this.avatar_frame=new PIXI.Sprite(assets.circle_frame50);
		this.avatar_frame.x=-12;
		this.avatar_frame.y=-12;
		this.avatar_frame.width=this.avatar_frame.height=84;
		
		this.t_name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 22,align: 'center'});
		this.t_name.anchor.set(0.5,0.5);
		this.t_name.x=30;
		this.t_name.y=70;
		this.t_name.tint=0xffffff;		

		this.rating=0;
		this.t_level=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 22,align: 'center'});
		this.t_level.tint=0xffff00;
		this.t_level.anchor.set(0.5,0.5);
		this.t_level.x=30;
		this.t_level.y=85;		
		this.t_level.tint=0xaaaaaa;
		
		this.addChild(this.avatar,this.avatar_frame,this.t_name,this.t_level);
		
	}
	
}

class lb_player_card_class extends PIXI.Container{

	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(assets.lb_player_card_bcg);
		this.bcg.interactive=true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};
		this.bcg.width = 370;
		this.bcg.height = 70;

		this.place=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.place.tint=0xffffff;
		this.place.x=20;
		this.place.y=22;

		this.avatar=new PIXI.Sprite();
		this.avatar.x=43;
		this.avatar.y=14;
		this.avatar.width=this.avatar.height=44;


		this.name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.name.tint=0xcceeff;
		this.name.x=105;
		this.name.y=22;

		this.rating=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.rating.x=298;
		this.rating.tint=0xFFFF00;
		this.rating.y=22;

		this.addChild(this.bcg,this.place, this.avatar, this.name, this.rating);
	}


}

class mk_character_card_class extends PIXI.Container{
	
	constructor() {
		
		super();
		this.rating=1400;
		this.name='';
		
		this.avatar=new PIXI.Sprite(PIXI.Texture.WHITE);
		this.avatar.width=240;
		this.avatar.height=160;
		this.avatar.x=this.avatar.y=20;
		
		this.name_bt=new PIXI.BitmapText('Shao Khan', {fontName: 'mfont',fontSize: 30});
		this.name_bt.x=30;
		this.name_bt.y=148;		
		
		
		this.rating_bt=new PIXI.BitmapText('1788', {fontName: 'mfont',fontSize: 30});
		this.rating_bt.x=210;
		this.rating_bt.y=30;
		
		this.level_bt=new PIXI.BitmapText('0', {fontName: 'mfont',fontSize: 35});
		this.level_bt.x=30;
		this.level_bt.y=30;
		this.level_bt.tint=0xffff00;
		
		this.frame=new PIXI.Sprite(assets.frame);
		this.frame.width=280;
		this.frame.height=200;
		
		this.addChild(this.avatar,this.frame,this.name_bt,this.rating_bt,this.level_bt)
	}
	
	
	
}

class chat_record_class extends PIXI.Container {
	
	constructor() {
		
		super();
		
		this.tm=0;
		this.index=0;
		this.uid='';	

		
		this.avatar = new PIXI.Graphics();
		this.avatar.w=50;
		this.avatar.h=50;
		this.avatar.x=30;
		this.avatar.y=13;		
				
		this.avatar_bcg = new PIXI.Sprite(assets.chat_avatar_bcg_img);
		this.avatar_bcg.width=70;
		this.avatar_bcg.height=70;
		this.avatar_bcg.x=this.avatar.x-10;
		this.avatar_bcg.y=this.avatar.y-10;
		this.avatar_bcg.interactive=true;
		this.avatar_bcg.pointerdown=()=>chat.avatar_down(this);		
					
		this.avatar_frame = new PIXI.Sprite(assets.circle_frame50);
		this.avatar_frame.width=70;
		this.avatar_frame.height=70;
		this.avatar_frame.x=this.avatar.x-10;
		this.avatar_frame.y=this.avatar.y-10;
		
		this.name = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: 17});
		this.name.anchor.set(0,0.5);
		this.name.x=this.avatar.x+72;
		this.name.y=this.avatar.y-1;	
		this.name.tint=0xFBE5D6;
		
		this.gif=new PIXI.Sprite();
		this.gif.x=this.avatar.x+65;	
		this.gif.y=22;
		
		this.gif_bcg=new PIXI.Graphics();
		this.gif_bcg.beginFill(0x111111)
		this.gif_bcg.drawRect(0,0,1,1);
		this.gif_bcg.x=this.gif.x+3;	
		this.gif_bcg.y=this.gif.y+3;
		this.gif_bcg.alpha=0.5;
		
		
				
		this.msg_bcg = new PIXI.NineSlicePlane(assets.msg_bcg,50,18,50,28);
		//this.msg_bcg.width=160;
		//this.msg_bcg.height=65;	
		this.msg_bcg.scale_xy=0.66666;		
		this.msg_bcg.x=this.avatar.x+45;	
		this.msg_bcg.y=this.avatar.y+2;
		
		this.msg = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: 19,lineSpacing:55,align: 'left'}); 
		this.msg.x=this.avatar.x+75;
		this.msg.y=this.avatar.y+30;
		this.msg.maxWidth=450;
		this.msg.anchor.set(0,0.5);
		this.msg.tint = 0xffffff;
		
		this.msg_tm = new PIXI.BitmapText('28.11.22 12:31', {fontName: 'mfont',fontSize: 15}); 		
		this.msg_tm.tint=0xffffff;
		this.msg_tm.alpha=0.6;
		this.msg_tm.anchor.set(1,0);
		
		this.visible = false;
		this.addChild(this.msg_bcg,this.gif_bcg,this.gif,this.avatar_bcg,this.avatar,this.avatar_frame,this.name,this.msg,this.msg_tm);
		
	}
		
	nameToColor(name) {
		  // Create a hash from the name
		  let hash = 0;
		  for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash; // Convert to 32bit integer
		  }

		  // Generate a color from the hash
		  let color = ((hash >> 24) & 0xFF).toString(16) +
					  ((hash >> 16) & 0xFF).toString(16) +
					  ((hash >> 8) & 0xFF).toString(16) +
					  (hash & 0xFF).toString(16);

		  // Ensure the color is 6 characters long
		  color = ('000000' + color).slice(-6);

		  // Convert the hex color to an RGB value
		  let r = parseInt(color.slice(0, 2), 16);
		  let g = parseInt(color.slice(2, 4), 16);
		  let b = parseInt(color.slice(4, 6), 16);

		  // Ensure the color is bright enough for a black background
		  // by normalizing the brightness.
		  if ((r * 0.299 + g * 0.587 + b * 0.114) < 128) {
			r = Math.min(r + 128, 255);
			g = Math.min(g + 128, 255);
			b = Math.min(b + 128, 255);
		  }

		  return (r << 16) + (g << 8) + b;
	}
		
	async update_avatar(uid, tar_sprite) {		
	
		//определяем pic_url
		await players_cache.update(uid);
		await players_cache.update_avatar(uid);
		tar_sprite.set_texture(players_cache.players[uid].texture);	
	}
	
	async set(msg_data) {
						
		//получаем pic_url из фб
		this.avatar.set_texture(PIXI.Texture.WHITE);
				
		await this.update_avatar(msg_data.uid, this.avatar);

		this.uid=msg_data.uid;
		this.tm = msg_data.tm;			
		this.index = msg_data.index;		
		
		this.name.set2(msg_data.name,150);
		this.name.tint=this.nameToColor(msg_data.name);
		this.msg_tm.text = new Date(msg_data.tm).toLocaleString();
		this.msg.text=msg_data.msg;
		this.visible = true;
		
		if (msg_data.msg.startsWith('GIF')){			
			
			const mp4BaseT=await new Promise((resolve, reject)=>{
				const baseTexture = PIXI.BaseTexture.from('https://akukamil.github.io/common/gifs/'+msg_data.msg+'.mp4');
				if (baseTexture.width>1) resolve(baseTexture);
				baseTexture.on('loaded', () => resolve(baseTexture));
				baseTexture.on('error', (error) => resolve(null));
			});
			
			if (!mp4BaseT) {
				this.visible=false;
				return 0;
			}
			
			mp4BaseT.resource.source.play();
			mp4BaseT.resource.source.loop=true;
			
			this.gif.texture=PIXI.Texture.from(mp4BaseT);
			this.gif.visible=true;	
			const aspect_ratio=mp4BaseT.width/mp4BaseT.height;
			this.gif.height=90;
			this.gif.width=this.gif.height*aspect_ratio;
			this.msg_bcg.visible=false;
			this.msg.visible=false;
			this.msg_tm.anchor.set(0,0);
			this.msg_tm.y=this.gif.height+9;
			this.msg_tm.x=this.gif.width+102;
			
			this.gif_bcg.visible=true;
			this.gif_bcg.height=this.gif.height;
			this.gif_bcg.width=	this.gif.width;
			return this.gif.height+30;
			
		}else{
			
			this.gif_bcg.visible=false;
			this.gif.visible=false;	
			this.msg_bcg.visible=true;
			this.msg.visible=true;
			
			//бэкграунд сообщения в зависимости от длины
			const msg_bcg_width=Math.max(this.msg.width,100)+100;			
			this.msg_bcg.width=msg_bcg_width*1.5;				
					
			if (msg_bcg_width>300){
				this.msg_tm.anchor.set(1,0);
				this.msg_tm.y=this.avatar.y+52;
				this.msg_tm.x=msg_bcg_width+55;
			}else{
				this.msg_tm.anchor.set(0,0);
				this.msg_tm.y=this.avatar.y+37;
				this.msg_tm.x=msg_bcg_width+62;
			}	
			
			return 70;
		}		
	}		

}

class feedback_record_class extends PIXI.Container {
	
	constructor() {
		
		super();		
		this.text=new PIXI.BitmapText('Николай: хорошая игра', {fontName: 'mfont',fontSize: 22,align: 'left',lineSpacing:45}); 
		this.text.maxWidth=290;
		this.text.tint=0xFFFF00;
		
		this.name_text=new PIXI.BitmapText('Николай:', {fontName: 'mfont',fontSize: 22,align: 'left'}); 
		this.name_text.tint=0xFFFFFF;
		
		
		this.addChild(this.text,this.name_text)
	}		
	
	set(name, feedback_text){
		this.text.text=name+': '+feedback_text;
		this.name_text.text=name+':';
	
	}
	
	
}

class theme_class extends PIXI.Container{
	
	constructor(){
		
		super();
		this.shadow=new PIXI.Sprite(assets.bcg_icon_shadow);
		this.shadow.width=170;
		this.shadow.height=100;	
		
		this.bcg=new PIXI.Sprite(assets.theme_0);
		this.bcg.width=170;
		this.bcg.height=100;
		
		this.lock=new PIXI.Sprite(assets.lock);
		this.lock.width=70;
		this.lock.height=70;
		this.lock.anchor.set(0.5,0.5);
		this.lock.x=140;
		this.lock.y=65;
		this.lock.angle=30;
		this.lock.visible=false;
		
		this.id=0;
		
		this.interactive=true;
		this.buttonMode=true;
		this.pointerdown=function(){pref.theme_down(this)};
		
		this.addChild(this.bcg,this.lock)
		
	}	
	
	set_theme(id){
		this.id=id;
		this.bcg.texture=assets['theme_'+id];
	}
	
}

anim2 = {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0, visible:false, ready:true, alpha:0},
		
	slot: Array(30).fill(null),
		
	
	any_on() {		
		for (let s of this.slot)
			if (s !== null&&s.block)
				return true
		return false;			
	},
	
	linear(x) {
		return x
	},
	
	kill_anim(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj){
					this.slot[i].p_resolve('finished');		
					this.slot[i].obj.ready=true;					
					this.slot[i]=null;	
				}
	
	},
	
	flick(x){
		
		return Math.abs(Math.sin(x*6.5*3.141593));
		
	},
	
	easeBridge(x){
		
		if(x<0.1)
			return x*10;
		if(x>0.9)
			return (1-x)*10;
		return 1		
	},
	
	ease3peaks(x){

		if (x < 0.16666) {
			return x / 0.16666;
		} else if (x < 0.33326) {
			return 1-(x - 0.16666) / 0.16666;
		} else if (x < 0.49986) {
			return (x - 0.3326) / 0.16666;
		} else if (x < 0.66646) {
			return 1-(x - 0.49986) / 0.16666;
		} else if (x < 0.83306) {
			return (x - 0.6649) / 0.16666;
		} else if (x >= 0.83306) {
			return 1-(x - 0.83306) / 0.16666;
		}		
	},
	
	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutBack2(x) {
		return -5.875*Math.pow(x, 2)+6.875*x;
	},
	
	easeOutElastic(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad(x) {
		return x * x;
	},
	
	easeOutBounce(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},
	
	easeInCubic(x) {
		return x * x * x;
	},
	
	ease2back(x) {
		return Math.sin(x*Math.PI);
	},
	
	easeInOutCubic(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake(x) {
		
		return Math.sin(x*2 * Math.PI);	
		
	},	
	
	add (obj, params, vis_on_end, time, func, block=true) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);

		let f=0;
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {
				
				obj.visible = true;
				obj.ready = false;

				//добавляем дельту к параметрам и устанавливаем начальное положение
				for (let key in params) {
					params[key][2]=params[key][1]-params[key][0];					
					obj[key]=params[key][0];
				}
				
				//для возвратных функцие конечное значение равно начальному
				if (func === 'ease2back' || func === 'shake' || func === 'ease3peaks')
					for (let key in params)
						params[key][1]=params[key][0];				
					
				this.slot[i] = {
					obj,
					block,
					params,
					vis_on_end,
					func: this[func].bind(anim2),
					speed: 0.01818 / time,
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");	
			
			
			//сразу записываем конечные параметры анимации
			for (let key in params)				
				obj[key]=params[key][1];			
			obj.visible=vis_on_end;
			obj.alpha = 1;
			obj.ready=true;
			
			
			return new Promise(function(resolve, reject){					
			  resolve();	  		  
			});	
		}
		else {
			return new Promise(function(resolve, reject){					
			  anim2.slot[i].p_resolve = resolve;	  		  
			});			
			
		}

		
		

	},	
		
	process() {
		
		for (var i = 0; i < this.slot.length; i++)
		{
			if (this.slot[i] !== null) {
				
				let s=this.slot[i];
				
				s.progress+=s.speed;		
				
				for (let key in s.params)				
					s.obj[key]=s.params[key][0]+s.params[key][2]*s.func(s.progress);		
				
				//если анимация завершилась то удаляем слот
				if (s.progress>=0.999) {
					for (let key in s.params)				
						s.obj[key]=s.params[key][1];
									
					s.obj.visible=s.vis_on_end;
					if (s.vis_on_end === false)
						s.obj.alpha = 1;
					
					s.obj.ready=true;					
					s.p_resolve('finished');
					this.slot[i] = null;
				}
			}			
		}
		
	},
	
	async wait(time) {
		
		await this.add(this.empty_spr,{x:[0, 1]}, false, time,'linear');	
		
	}
}

sound={	
	
	on : 1,
	
	play(res_name, res_src) {
		
		res_src=res_src||assets;
		
		if (!this.on||document.hidden)
			return;
		
		if (!assets[res_name])
			return;
		
		assets[res_name].play();	
		
	},
	
	switch(){
		
		if (this.on){
			this.on=0;
			objects.pref_info.text=['Звуки отключены','Sounds is off'][LANG];
			
		} else{
			this.on=1;
			objects.pref_info.text=['Звуки включены','Sounds is on'][LANG];
		}
		anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);		
		
	}
	
}

message={
	
	promise_resolve :0,
	
	async add(text, timeout) {
		
		if (this.promise_resolve!==0)
			this.promise_resolve('forced');
		
		if (timeout === undefined) timeout = 3000;
		
		//воспроизводим звук
		sound.play('message');

		objects.message_text.text=text;

		await anim2.add(objects.message_cont,{x:[-200,objects.message_cont.sx]}, true, 0.25,'easeOutBack',false);

		let res = await new Promise((resolve, reject) => {
				message.promise_resolve = resolve;
				setTimeout(resolve, timeout)
			}
		);
		
		
		message.promise_resolve=0;
		if (res === "forced")
			return;

		anim2.add(objects.message_cont,{x:[objects.message_cont.sx, -200]}, false, 0.25,'easeInBack',false);			
	},
	
	close(){
		
		if(this.promise_resolve!==0){
			message.promise_resolve('forced');
			objects.message_cont.visible=false;
		}
			
		
	},
	
	clicked() {
		
		
		message.promise_resolve();
		
	}

}

big_message={
	
	p_resolve : 0,
		
	show(t1,t2, feedback_on) {
				
		if (t2!==undefined || t2!=="")
			objects.big_message_text2.text=t2;
		else
			objects.big_message_text2.text='**********';

		objects.big_message_text.text=t1;
		
		objects.feedback_button.visible = feedback_on&&!my_data.blocked;
		
		anim2.add(objects.big_message_cont,{y:[-180, objects.big_message_cont.sy]},true,0.4,'easeOutBack');

		//закрываем диалоги
		if(pawn_replace_dialog.on) pawn_replace_dialog.close();
		if(mini_dialog.on) mini_dialog.close();	
		
		return new Promise(function(resolve, reject){					
			big_message.p_resolve = resolve;	  		  
		});
	},

	async feedback_down() {
		
		if (objects.big_message_cont.ready===false || this.feedback_on === 0) {
			sound.play('locked');
			return;			
		}


		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.sy,450]}, false, 0.4,'easeInBack');	
		
		//пишем отзыв и отправляем его		
		const fb = await keyboard.read();		
		if (fb.length>0) {
			const fb_id = irnd(0,50);			
			await fbs.ref('fb/'+opp_data.uid+'/'+fb_id).set([fb, firebase.database.ServerValue.TIMESTAMP, my_data.name]);
		
		}		
		this.p_resolve('close');
				
	},

	close() {
		
		if (objects.big_message_cont.ready===false)
			return;

		sound.play('close');
		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.y, 450]},false,0.4,'easeInBack');
		
		this.p_resolve("close");			
	}

}

chat={
	
	last_record_end : 0,
	drag : false,
	data:[],
	touch_y:0,
	drag_chat:false,
	drag_sx:0,
	drag_sy:-999,	
	recent_msg:[],
	moderation_mode:0,
	block_next_click:0,
	kill_next_click:0,
	delete_message_mode:0,
	games_to_chat:200,
	payments:0,
	processing:0,
	remote_socket:0,
	ss:[],
		
	activate() {	

		anim2.add(objects.chat_cont,{alpha:[0, 1]}, true, 0.1,'linear');
		//objects.bcg.texture=assets.lobby_bcg;
		objects.chat_enter_button.visible=my_data.games>=this.games_to_chat;
		
		if(my_data.blocked)		
			objects.chat_enter_button.texture=assets.chat_blocked_img;
		else
			objects.chat_enter_button.texture=assets.chat_enter_img;

		objects.chat_rules.text='Правила чата!\n1. Будьте вежливы: Общайтесь с другими игроками с уважением. Избегайте угроз, грубых выражений, оскорблений, конфликтов.\n2. Отправлять сообщения в чат могут игроки сыгравшие более 200 онлайн партий.\n3. За нарушение правил игрок может попасть в черный список.'
		if(my_data.blocked) objects.chat_rules.text='Вы не можете писать в чат, так как вы находитесь в черном списке';
		
		
	},
		
	new_message(data){
		
		console.log('new_data',data);
		
	},
	
	async init(){	
			
		this.last_record_end = 0;
		objects.chat_msg_cont.y = objects.chat_msg_cont.sy;		
		objects.bcg.interactive=true;
		objects.bcg.pointermove=this.pointer_move.bind(this);
		objects.bcg.pointerdown=this.pointer_down.bind(this);
		objects.bcg.pointerup=this.pointer_up.bind(this);
		objects.bcg.pointerupoutside=this.pointer_up.bind(this);
		
		for(let rec of objects.chat_records) {
			rec.visible = false;			
			rec.msg_id = -1;	
			rec.tm=0;
		}		
		
		this.init_yandex_payments();

		await my_ws.init();	
		
		//загружаем чат		
		const chat_data=await my_ws.get(`${game_name}/chat`,25);
		
		await this.chat_load(chat_data);
		
		//подписываемся на новые сообщения
		my_ws.ss_child_added(`${game_name}/chat`,chat.chat_updated.bind(chat))
		
		console.log('Чат загружен!')
	},		

	init_yandex_payments(){
				
		if (game_platform!=='YANDEX') return;			
				
		if(this.payments) return;
		
		ysdk.getPayments({ signed: true }).then(_payments => {
			chat.payments = _payments;
		}).catch(err => {})			
		
	},	

	get_oldest_index () {
		
		let oldest = {tm:9671801786406 ,visible:true};		
		for(let rec of objects.chat_records)
			if (rec.tm < oldest.tm)
				oldest = rec;	
		return oldest.index;		
		
	},
	
	get_oldest_or_free_msg () {
		
		//проверяем пустые записи чата
		for(let rec of objects.chat_records)
			if (!rec.visible)
				return rec;
		
		//если пустых нет то выбираем самое старое
		let oldest = {tm:9671801786406};		
		for(let rec of objects.chat_records)
			if (rec.visible===true && rec.tm < oldest.tm)
				oldest = rec;	
		return oldest;		
		
	},
		
	block_player(uid){
		
		fbs.ref('blocked/'+uid).set(Date.now());
		fbs.ref('inbox/'+uid).set({message:'CHAT_BLOCK',tm:Date.now()});
		
		//увеличиваем количество блокировок
		fbs.ref('players/'+uid+'/block_num').transaction(val=> {return (val || 0) + 1});
		
	},
		
	async chat_load(data) {
		
		if (!data) return;
		
		//превращаем в массив
		data = Object.keys(data).map((key) => data[key]);
		
		//сортируем сообщения от старых к новым
		data.sort(function(a, b) {	return a.tm - b.tm;});
			
		//покаываем несколько последних сообщений
		for (let c of data)
			await this.chat_updated(c,true);	
	},	
				
	async chat_updated(data, first_load) {		
	
		//console.log('chat_updated:',JSON.stringify(data).length);
		if(data===undefined||!data.msg||!data.name||!data.uid) return;
				
		//ждем пока процессинг пройдет
		for (let i=0;i<10;i++){			
			if (this.processing)
				await new Promise(resolve => setTimeout(resolve, 250));				
			else
				break;				
		}
		if (this.processing) return;
							
		this.processing=1;
		
		//выбираем номер сообщения
		const new_rec=this.get_oldest_or_free_msg();
		const y_shift=await new_rec.set(data);
		new_rec.y=this.last_record_end;
		
		this.last_record_end += y_shift;		

		if (!first_load)
			lobby.inst_message(data);
		
		//смещаем на одно сообщение (если чат не видим то без твина)
		if (objects.chat_cont.visible)
			await anim2.add(objects.chat_msg_cont,{y:[objects.chat_msg_cont.y,objects.chat_msg_cont.y-y_shift]},true, 0.05,'linear');		
		else
			objects.chat_msg_cont.y-=y_shift
		
		this.processing=0;
		
	},
						
	avatar_down(player_data){
		
		if (this.moderation_mode){
			console.log(player_data.index,player_data.uid,player_data.name.text,player_data.msg.text);
			fbs_once('players/'+player_data.uid+'/games').then((data)=>{
				console.log('сыграно игр: ',data)
			})
		}
		
		if (this.block_next_click){			
			this.block_player(player_data.uid);
			console.log('Игрок заблокирован: ',player_data.uid);
			this.block_next_click=0;
		}
		
		if (this.kill_next_click){			
			fbs.ref('inbox/'+player_data.uid).set({message:'CLIEND_ID',tm:Date.now(),client_id:999999});
			console.log('Игрок убит: ',player_data.uid);
			this.kill_next_click=0;
		}
			
		
		if(this.moderation_mode||this.block_next_click||this.kill_next_click||this.delete_message_mode) return;
		
		if (objects.chat_keyboard_cont.visible)		
			keyboard.response_message(player_data.uid,player_data.name.text);
		else
			lobby.show_invite_dialog_from_chat(player_data.uid,player_data.name.text);
		
		
	},
			
	get_abs_top_bottom(){
		
		let top_y=999999;
		let bot_y=-999999
		for(let rec of objects.chat_records){
			if (rec.visible===true){
				const cur_abs_top=objects.chat_msg_cont.y+rec.y;
				const cur_abs_bot=objects.chat_msg_cont.y+rec.y+rec.height;
				if (cur_abs_top<top_y) top_y=cur_abs_top;
				if (cur_abs_bot>bot_y) bot_y=cur_abs_bot;
			}		
		}
		
		return [top_y,bot_y];				
		
	},
	
	back_button_down(){
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		this.close();
		lobby.activate();
		
	},
	
	pointer_move(e){		
	
		if (!this.drag_chat) return;
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;
		
		const dy=my-this.drag_sy;		
		this.drag_sy=my;
		
		this.shift(dy);

	},
	
	pointer_down(e){
		
		const px=e.data.global.x/app.stage.scale.x;
		this.drag_sy=e.data.global.y/app.stage.scale.y;
		
		this.drag_chat=true;
		objects.chat_cont.by=objects.chat_cont.y;				

	},
	
	pointer_up(){
		
		this.drag_chat=false;
		
	},
	
	shift(dy) {				
		
		const [top_y,bot_y]=this.get_abs_top_bottom();
		
		//проверяем движение чата вверх
		if (dy<0){
			const new_bottom=bot_y+dy;
			const overlap=435-new_bottom;
			if (new_bottom<435) dy+=overlap;
		}
	
		//проверяем движение чата вниз
		if (dy>0){
			const new_top=top_y+dy;
			if (new_top>50)
				return;
		}
		
		objects.chat_msg_cont.y+=dy;
		
	},
		
	wheel_event(delta) {
		
		objects.chat_msg_cont.y-=delta*50;	
		const chat_bottom = this.last_record_end;
		const chat_top = this.last_record_end - objects.chat_records.filter(obj => obj.visible === true).length*70;
		
		if (objects.chat_msg_cont.y+chat_bottom<430)
			objects.chat_msg_cont.y = 430-chat_bottom;
		
		if (objects.chat_msg_cont.y+chat_top>0)
			objects.chat_msg_cont.y=-chat_top;
		
	},
	
	make_hash() {
	  let hash = '';
	  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	  for (let i = 0; i < 6; i++) {
		hash += characters.charAt(Math.floor(Math.random() * characters.length));
	  }
	  return hash;
	},
		
	async write_button_down(){
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
				
		//оплата разблокировки чата
		if (my_data.blocked){	
		
			let block_num=await fbs_once('players/'+my_data.uid+'/block_num');
			block_num=block_num||1;
			block_num=Math.min(6,block_num);
		
			if(game_platform==='YANDEX'){
				
				this.payments.purchase({ id: 'unblock'+block_num}).then(purchase => {
					this.unblock_chat();
				}).catch(err => {
					message.add('Ошибка при покупке!');
				})				
			}
			
			if (game_platform==='VK') {
				
				vkBridge.send('VKWebAppShowOrderBox', { type: 'item', item: 'unblock'+block_num}).then(data =>{
					this.unblock_chat();
				}).catch((err) => {
					message.add('Ошибка при покупке!');
				});			
			
			};			
				
			return;
		}
				
		sound.play('click');
		
		//убираем метки старых сообщений
		const cur_dt=Date.now();
		this.recent_msg = this.recent_msg.filter(d =>cur_dt-d<60000);
				
		if (this.recent_msg.length>3){
			message.add('Подождите 1 минуту')
			return;
		}		
		
		//добавляем отметку о сообщении
		this.recent_msg.push(Date.now());
		
		//пишем сообщение в чат и отправляем его		
		const msg = await keyboard.read(70);		
		if (msg) {			
			const index=irnd(1,999);
			my_ws.socket.send(JSON.stringify({cmd:'push',path:`${game_name}/chat`,val:{uid:my_data.uid,name:my_data.name,msg,tm:'TMS'}}))	
			//fbs.ref(chat_path+'/'+index).set({uid:my_data.uid,name:my_data.name,msg, tm:firebase.database.ServerValue.TIMESTAMP,index});
		}	
		
	},
	
	unblock_chat(){
		objects.chat_rules.text='Правила чата!\n1. Будьте вежливы: Общайтесь с другими игроками с уважением. Избегайте угроз, грубых выражений, оскорблений, конфликтов.\n2. Отправлять сообщения в чат могут игроки сыгравшие более 200 онлайн партий.\n3. За нарушение правил игрок может попасть в черный список.'
		objects.chat_enter_button.texture=assets.chat_enter_img;	
		fbs.ref('blocked/'+my_data.uid).remove();
		my_data.blocked=0;
		message.add('Вы разблокировали чат');
		sound.play('mini_dialog');	
	},
		
	close() {
		
		anim2.add(objects.chat_cont,{alpha:[1, 0]}, false, 0.1,'linear');
		if (objects.chat_keyboard_cont.visible)
			keyboard.close();
	}
		
}

board_func={

	update_board(){

		//сначала скрываем все шашки
		objects.figures.forEach(c=>c.visible=false);

		var i=0;
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {

				const piece = g_board[y][x];
				if (piece==='x') continue
				
				//мои это которые большие
				const is_my_piece = my_pieces.includes(piece);
				const piece_texture_name=[game.op_color,game.my_color][+is_my_piece]+piece.toLowerCase();
				const f=objects.figures[i];
				f.texture = pref.cur_pieces_textures[piece_texture_name];

				f.x = x * 50 + objects.board.x + 20;
				f.y = y * 50 + objects.board.y + 20;

				f.ix = x;
				f.iy = y;
				
				f.piece = piece;
				f.alpha = 1;

				f.visible = true;
				i++;
			}
		}

	},
	
	rotate_board(brd){		
	
		const new_board=JSON.parse(JSON.stringify(brd));
		for (x=0;x<8;x++){
			for(y=0;y<8;y++){				
				let figure=new_board[7-y][7-x];
				if(figure!=='x'){
					
					if (figure===figure.toUpperCase())
						figure=figure.toLowerCase();
					else
						figure=figure.toUpperCase();
				}				
				brd[y][x]=figure;						
			}
		}

		
	},
	
	get_fen(brd) {
		
		let fen = "";
		
		for (var y = 0; y < 8; y++) {	
			
			let prv_f = '';
			let cnt_e = 0;
			
			for (var x = 0; x < 8; x++) {
				
				if (brd[y][x]==='x')				
					cnt_e ++;
					
				if (brd[y][x] !=='x') {
					
					if (cnt_e > 0 ) {
						fen = fen + cnt_e;
						cnt_e = 0;
					}

					fen = fen + brd[y][x]
				}
				
				if ( x === 7 && cnt_e > 0)					
					fen = fen + cnt_e;
			}
			
			if (y !== 7)
				fen = fen + '/';
		}	
		
		return fen;
		
	},

	brd_to_str(brd){		
		let str = "";
		for (var y = 0; y < 8; y++)	
			for (var x = 0; x < 8; x++)
				str+=brd[y][x];
		return str;
	},
	
	str_to_brd(str){	
	
		let brd = [['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['','','','','','','',''],['','','','','','','','']];
		
		let i=0;
		for (var y = 0; y < 8; y++)	
			for (var x = 0; x < 8; x++)
				brd[y][x]=str[i++];
		return brd;
	},
	
	fen_to_board(fen){
		
		const rows = fen.split(' ')[0].split('/');
		const board = [];

		for (let i = 0; i < 8; i++) {
			const row = rows[i];
			const boardRow = [];

			for (let j = 0; j < row.length; j++) {
				const char = row[j];

				if (isNaN(char)) {
					boardRow.push(char);
				} else {
					for (let k = 0; k < parseInt(char); k++) {
					boardRow.push('x');
					}
				}
			}

			board.push(boardRow);
		}

		return board;		
	},

	get_checker_by_pos(x,y) {

		for (let c of objects.figures)
			if (c.visible&&c.ix===x&&c.iy===y)
				return c;
		return 0;
	},
	
	get_moves_on_dir (brd, f, dx, dy, max_moves, figures_to_eat) {
				
		//текущее положение
		const cx = f.ix;
		const cy = f.iy;
		let valid_moves = [];

		for (let i = 1 ; i < max_moves; i++) {
			
			const tx = cx + i * dx;
			const ty = cy + i * dy;
			
			if ( tx > -1 && tx < 8 && ty > -1 && ty < 8 ) {
				if (brd[ty][tx] === 'x') {
					valid_moves.push(tx+'_'+ty)						
				} else {						
					if (figures_to_eat.includes(brd[ty][tx]) === true)
						valid_moves.push(tx+'_'+ty)
					break;
				}							
			}	
		}
		
		return valid_moves;
		
	},
	
	get_figure_pos(brd, f_name) {		
		
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {

				const t = brd[y][x];
				if (t===f_name)
					return x+'_'+y;
			}
		}	
	},
	
	get_valid_moves(brd, f) {
		
		const valid_moves =[];
		
		//фигуры которые будут есть
		let figures_to_eat=my_pieces;
		if(my_pieces.includes(f.piece))
			figures_to_eat=op_pieces;
		
		
		//создаем массив возможных ходов
		if (f.piece === 'P' || f.piece === 'p') {
							
			const dy =  f.piece === 'p' ? 1 : -1;
			
			//проверяем возможность хода вперед на одну клетку
			const cx = f.ix;
			const cy = f.iy;
			let tx = cx;
			let ty = cy + dy;				
			if (ty > -1 && ty < 8)
				if (brd[ty][tx] === 'x')				
					valid_moves.push(tx+'_'+ty)
			
			//проверяем возможность хода вперед на две клетки
			const iy =  f.piece === 'p' ? 1 : 6;
			tx = cx;
			ty = cy + dy + dy;				
			if (ty > -1 && ty < 8  && cy === iy)
				if (brd[ty][tx] === 'x' && brd[ty+1][tx] === 'x')				
					valid_moves.push(tx+'_'+ty)

			//проверяем возможность есть влево
			tx = cx - 1;
			ty = cy + dy;				
			if (ty > -1 && ty < 8 && tx > -1)
				if (figures_to_eat.includes(brd[ty][tx])  === true)				
					valid_moves.push(tx+'_'+ty)			
			
			//проверяем возможность есть вправо
			tx = cx + 1;
			ty = cy + dy;				
			if (ty > -1 && ty < 8 && tx < 8)
				if (figures_to_eat.includes(brd[ty][tx])  === true)				
					valid_moves.push(tx+'_'+ty)
							
			
			//проверяем возможность взятия пешки на проходе
			if (f.piece === 'P' && f.iy === 3 && game.pass_take_flag !== -1) {
				
				tx = cx - 1;
				if (tx === game.pass_take_flag)
					valid_moves.push(tx+'_'+2);				
				
				tx = cx + 1;
				if (tx === game.pass_take_flag)
					valid_moves.push(tx+'_'+2);				
			}
			
				
			return valid_moves;
			
		}
		
		if (f.piece === 'R' || f.piece === 'r') {
			
			//текущее положение
			const cx = f.ix;
			const cy = f.iy;
			
			const m0 = this.get_moves_on_dir(brd,f, -1 , 0, 8, figures_to_eat);
			const m1 = this.get_moves_on_dir(brd,f, 1 , 0, 8, figures_to_eat);
			const m2 = this.get_moves_on_dir(brd,f, 0 , -1, 8, figures_to_eat);
			const m3 = this.get_moves_on_dir(brd,f, 0 , 1, 8, figures_to_eat);
			
			return [...m0,...m1,...m2,...m3];
			
		}
		
		if (f.piece === 'N' || f.piece === 'n') {
			
			//направления ходов коня [dx,dy]]
			let moves_dir = [[-2,-1],[-1,-2],[1,-2],[2,-1],[2,1],[1,2],[-1,2],[-2,1]];
			for ( let v = 0 ; v < 8 ; v++ ) {
				const tx = f.ix + moves_dir[v][0];
				const ty = f.iy + moves_dir[v][1];
				
				//заносим в перечень валадных ходов
				if ( tx > -1 && tx < 8 && ty > -1 && ty < 8) {
					
					if (brd[ty][tx] === 'x') {
						valid_moves.push(tx+'_'+ty)						
					} else {						
						if (figures_to_eat.includes(brd[ty][tx]) === true)
							valid_moves.push(tx+'_'+ty)
					}
				}		
			}
			
			return valid_moves;				
		}
		
		if (f.piece === 'B' || f.piece === 'b') {
			
			//текущее положение
			const cx = f.ix;
			const cy = f.iy;
			
			const m0 = this.get_moves_on_dir(brd,f, -1 , -1, 8, figures_to_eat);
			const m1 = this.get_moves_on_dir(brd,f, -1 , 1, 8, figures_to_eat);
			const m2 = this.get_moves_on_dir(brd,f, 1 , -1, 8, figures_to_eat);
			const m3 = this.get_moves_on_dir(brd,f, 1 , 1, 8, figures_to_eat);
			
			return [...m0,...m1,...m2,...m3];		
		
		}
		
		if (f.piece === 'K' || f.piece === 'k') {
			
			
			const m0 = this.get_moves_on_dir(brd,f, -1 , -1, 2, figures_to_eat);
			const m1 = this.get_moves_on_dir(brd,f, -1 , 1, 2, figures_to_eat);
			const m2 = this.get_moves_on_dir(brd,f, 1 , -1, 2, figures_to_eat);
			const m3 = this.get_moves_on_dir(brd,f, 1 , 1, 2, figures_to_eat);
			const m4 = this.get_moves_on_dir(brd,f, -1 , 0, 2, figures_to_eat);
			const m5 = this.get_moves_on_dir(brd,f, 1 , 0, 2, figures_to_eat);
			const m6 = this.get_moves_on_dir(brd,f, 0 , -1, 2, figures_to_eat);
			const m7 = this.get_moves_on_dir(brd,f, 0 , 1, 2, figures_to_eat);
			
			return [...m0,...m1,...m2,...m3,...m4,...m5,...m6,...m7];	
			
		}
		
		if (f.piece === 'Q' || f.piece === 'q') {
			
			//текущее положение
			const cx = f.ix;
			const cy = f.iy;
			
			const m0 = this.get_moves_on_dir(brd,f, -1 , -1, 8, figures_to_eat);
			const m1 = this.get_moves_on_dir(brd,f, -1 , 1, 8, figures_to_eat);
			const m2 = this.get_moves_on_dir(brd,f, 1 , -1, 8, figures_to_eat);
			const m3 = this.get_moves_on_dir(brd,f, 1 , 1, 8, figures_to_eat);
			const m4 = this.get_moves_on_dir(brd,f, -1 , 0, 8, figures_to_eat);
			const m5 = this.get_moves_on_dir(brd,f, 1 , 0, 8, figures_to_eat);
			const m6 = this.get_moves_on_dir(brd,f, 0 , -1, 8, figures_to_eat);
			const m7 = this.get_moves_on_dir(brd,f, 0 , 1, 8, figures_to_eat);
			
			return [...m0,...m1,...m2,...m3,...m4,...m5,...m6,...m7];		
			
		}

	},
	
	check_fin(brd, fig_to_move) {
		
		//проверяем завершение игры
		const fen = board_func.get_fen(brd) + ' ' + fig_to_move + ' - - 1 1';
		chess.load(fen);
		
		const is_check = chess.in_check();
		const is_checkmate = chess.in_checkmate();	
		const is_stalemate = chess.in_stalemate();
		const post_fix={'w':'_to_player','b':'_to_opponent'}[fig_to_move];
				
		if (is_checkmate) return 'checkmate'+post_fix;		
		if (is_stalemate) return 'stalemate';		
		if (is_check) return 'check'+post_fix;
		return '';
	}

}

mini_dialog={
	
	resolver:0,
	on:0,
	
	show (req) {
		
		if (this.resolver) this.resolver(0);
		
		if (anim2.any_on()){
			sound.play('locked');
			return
		}
		
		sound.play('mini_dialog');	
		
		objects.t5.text = req;
		this.on=1;
		anim2.add(objects.mini_dialog,{y:[450,objects.mini_dialog.sy]}, true, 0.3,'linear');
		
		return new Promise(r=>{
			mini_dialog.resolver=r;
		})		

	},
	
	button_down(opt) {	
	
		if (anim2.any_on()){
			sound.play('locked');
			return
		}
		
		this.resolver(opt);
		this.close();
		
	},
			
	close() {
		
		if (!objects.mini_dialog.visible) return;
		
		if (this.resolver) this.resolver(0);
		this.resolver=0;
		this.on=0;
		anim2.add(objects.mini_dialog,{y:[objects.mini_dialog.y,450]}, false, 0.3,'linear');
	}
	
}

online_game={
	
	start_time:0,
	disconnect_time:0,
	move_time_left:0,
	timer:0,
	time_for_move:0,
	move_resolver:0,
	timer_prv_time:0,
	timer_start_time:0,
	me_conf_play:0,
	opp_conf_play:0,
	write_fb_timer:0,
	chat_out:1,
	chat_in:1,
	
	activate(role) {

		my_log.log_arr=[];
		my_log.add({event:'start',tm:Date.now(),my:my_data.uid,opp:opp_data.uid});
		
		//очищаем на всякий случай мк и квизы
		mk.switch_stop();
		quiz.close();
			
		objects.board.texture=pref.cur_board_texture;
		objects.bcg.texture=assets.bcg;
		anim2.add(objects.bcg,{alpha:[0,1]}, true, 0.5,'linear');	
		
		//ни я ни оппонент пока не подтвердили игру
		this.me_conf_play=false;
		this.opp_conf_play=false;

		//таймер
		objects.timer.visible=true;
		
		anim2.add(objects.game_buttons_cont,{x:[900, objects.game_buttons_cont.sx]},true,0.5,'linear');
		
		//устанавливаем статус в базе данных а если мы не видны то установливаем только скрытое состояние
		set_state({state : 'p'});
			
		
		//фиксируем врему начала игры
		this.start_time = Date.now();
		
		//обновляем время без связи
		this.disconnect_time = 0;
		this.timer_prv_time=Date.now();
		
		//вычиcляем рейтинг при проигрыше и устанавливаем его в базу он потом изменится
		let lose_rating = this.calc_new_rating(my_data.rating, LOSE);
		if (lose_rating >100 && lose_rating<9999)
			fbs.ref("players/"+my_data.uid+"/rating").set(lose_rating);
		

		game.activate(role,online_game)
		
		//обновляем стол
		fbs.ref('tables/'+game_id+'/master').set(my_data.uid);
		fbs.ref('tables/'+game_id+'/slave').set(opp_data.uid);
		
		//возможность чата
		this.chat_out=1;
		this.chat_in=1;
		objects.no_chat_button.alpha=1;
		objects.send_message_button.alpha=my_data.blocked?0.3:1;
		
		this.reset_timer();

	},
	
	disable_chat(){
		if (!this.chat_in) return;

		if (my_data.blocked){
			message.add(['Эта опция недоступна, так как вы находитесь в черном списке'][LANG]);			
			sound.play('locked');
			return;				
		}

		
		this.chat_in=0;		
		objects.no_chat_button.alpha=0.3;
		fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:'NOCHAT',tm:Date.now()});
		message.add(['Вы отключили чат','Chat disabled'][LANG]);
	},
	
	send_move(move_data) {
				
		my_log.add({event:'send_move',move_data,tm:Date.now()});
		this.me_conf_play=true;
		
		//переворачиваем данные о ходе так как оппоненту они должны попасть как ход шашками №2
		move_data.x1=7-move_data.x1;
		move_data.y1=7-move_data.y1;
		move_data.x2=7-move_data.x2;
		move_data.y2=7-move_data.y2;

		//отправляем ход сопернику
		clearTimeout(online_game.write_fb_timer);
		online_game.write_fb_timer=setTimeout(function(){online_game.stop('my_no_connection');}, 8000);  
		fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'MOVE',tm:Date.now(),data:move_data}).then(()=>{
			my_log.add({event:'write_fb_timer',tm:Date.now()});
			clearTimeout(online_game.write_fb_timer);
		});	
		
		//также фиксируем данные стола
		fbs.ref('tables/'+game_id+'/board').set({uid:my_data.uid,f_str:board_func.brd_to_str(g_board),tm:firebase.database.ServerValue.TIMESTAMP});
		
		this.reset_timer();
	},
	
	incoming_move(move_data){
		
		my_log.add({event:'incoming_move',move_data,tm:Date.now()});
		
		if(!objects.timer.visible){
			console.log('партия уже завершена')
			return;
		}
		
		this.opp_conf_play=true;
		
		game.process_op_move(move_data);
		
		this.reset_timer();
		
	},
	
	calc_new_rating(old_rating, game_result) {		
		
		if (game_result === NOSYNC)
			return old_rating;
		
		//не авторизованым игрокам нельзя выиграть более 2000
		if (my_data.rating>2000&&!my_data.auth_mode&&game_result === WIN)
			return old_rating;	
		
		var Ea = 1 / (1 + Math.pow(10, ((opp_data.rating-my_data.rating)/400)));
		if (game_result === WIN)
			return Math.round(my_data.rating + 16 * (1 - Ea));
		if (game_result === DRAW)
			return Math.round(my_data.rating + 16 * (0.5 - Ea));
		if (game_result === LOSE)
			return Math.round(my_data.rating + 16 * (0 - Ea));
		
	},
	
	giveup(){
		//это когда я сдаюсь
		fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'GIVEUP',tm:Date.now(),data:{}});		
		this.stop('player_gave_up');
	},
	
	async giveup_down(){
		
		if (anim2.any_on()){
			sound.play('locked');
			return
		}
		
		const time_since_start=Date.now()-this.start_time;
		if (time_since_start<30000){
			message.add(['Нельзя сдаваться в начале партии','Can not giveup on game start'][LANG]);
			return;
		}
		
		const res=await mini_dialog.show(['Сдаетесь?','Give Up?'][LANG]);
		if(res==='yes') this.giveup();
		
	},
	
	async draw_down(){
		
		if (anim2.any_on()||objects.mini_dialog.visible){
			sound.play('locked');
			return
		}	
				
		
		const res=await mini_dialog.show(['Предложить ничью?','Offer a draw?'][LANG]);
		if(res==='yes')
			fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"DRAWREQ",tm:Date.now(),data:{}});
		
	},
	
	async draw_request(){
		
		const res=await mini_dialog.show(['Согласны на ничью?','Agree to a draw?'][LANG]);
		
		if(res==='yes'){
			fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'DRAWOK',tm:Date.now(),data:{}});
			this.stop('draw');
		}			
		if(res==='no')
			fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'DRAWNO',tm:Date.now()});			
		
	},
	
	async send_message() {
				
		if (!this.chat_out||objects.chat_keyboard_cont.visible){
			sound.play('locked');
			return;				
		}
		
		if (my_data.blocked){
			message.add(['Вы не можете писать в чат, так как вы находитесь в черном списке'][LANG]);			
			sound.play('locked');
			return;				
		}
				
		sound.play('click');
		const msg=await keyboard.read();
		if (msg){
			fbs.ref('inbox/'+opp_data.uid).set({sender:my_data.uid,message:'CHAT',tm:Date.now(),data:msg});
			my_log.add({event:'send_message',msg,tm:Date.now()});
		};
	},
	
	chat(data) {
		if (!this.chat_in) return;
		message.add(data, 10000,'online_message');		
	},
	
	nochat(){
		
		this.chat_out=0;
		objects.send_message_button.alpha=0.3;
		message.add(['Соперник отключил чат','Chat disabled'][LANG]);
	},
	
	opp_giveup(){
		
		this.stop('op_gave_up');	
	},
	
	reset_timer(){
				
		my_log.add({event:'reset_timer',tm:Date.now()});
		objects.timer.visible=true;
		
		this.timer_start_time=Date.now();
		this.timer_prv_time=Date.now();
		this.disconnect_time=0;
		
		clearInterval(this.timer);
		this.timer=setInterval(function(){online_game.time_tick()},1000);
		
		this.me_conf_play&&this.opp_conf_play
			? this.time_for_move=45
			: this.time_for_move=15
			
		objects.timer.text = '0:'+this.time_for_move;
		objects.timer.x = [575,225][my_turn];
		objects.timer.tint=0xffffff;	
		
	},

	time_tick(){		
		
		//проверка таймера
		const cur_time=Date.now();
		if (cur_time-this.timer_prv_time>5000||cur_time<this.timer_prv_time){
			this.stop('timer_error');
			return;
		}
		this.timer_prv_time=cur_time;
		
		
		const time_passed=~~((cur_time-this.timer_start_time)*0.001);
		const time_left=this.time_for_move-time_passed;

		if (time_left >= 0) {
			time_left>9
				? objects.timer.text = '0:'+time_left
				: objects.timer.text = '0:0'+time_left
		}
		
		//подсвечиваем красным если осталость мало времени
		if (time_left === 10) {
			objects.timer.tint=0xff0000;
			sound.play('clock');
		}
		
		//если время закончилось у соперника
		if(time_left<=-5&&!my_turn){			
			this.opp_conf_play
				? this.stop('op_timeout')
				: this.stop('op_no_sync');
		}
		
		//если время закончилось у меня
		if(time_left<0&&my_turn){			
			this.me_conf_play
				? this.stop('my_timeout')
				: this.stop('my_no_sync');
		}
				
		//если нет соединения
		if (!connected) {
			this.disconnect_time++;
			if (this.disconnect_time > 5) {
				this.stop('my_no_connection');
				return;				
			}
		}		
		
	},
	
	async bad_game_process(){
		
		const opp_inbox_data=await fbs_once('inbox/'+opp_data.uid);
		my_log.add({event:'opp_inbox',opp_inbox_data,tm:Date.now()});
		fbs.ref('BAD_GAME/'+game_id + my_role).set(my_log.log_arr);
		
	},
	
	async stop(final_state) {					
		
		//отключаем взаимодейтсвие с доской
		objects.board.pointerdown=null;
		
		//отключаем таймер
		objects.timer.visible=false;
		clearTimeout(this.timer);	
		
		//элементы только для данного оппонента	
		objects.game_buttons_cont.visible=false;
		
		my_log.add({event:'stop',final_state,tm:Date.now()});

		if (final_state==='op_timeout'){			
			if (my_data.rating>=1800||opp_data.rating>=1800)
				this.bad_game_process();	
		}
						
		let res_db = {
			'my_no_connection' 		: [['Потеряна связь!\nИспользуйте надежное интернет соединение.','Lost connection!\nuse a reliable internet connection'], LOSE],
			'stalemate' 			: [['Пат!\nИгра закончилась ничьей.','Stalemate!\nthe game ended in a draw'], DRAW],
			'draw' 					: [['Игра закончилась ничьей.','The game ended in a draw'], DRAW],
			'draw_ins' 				: [['Игра закончилась ничьей (недостаточно фигур)','The game ended in a draw (insufficient_material)'], DRAW],
			'checkmate_to_opponent' : [['Победа!\nВы поставили мат!','Victory!\nYou checkmated'], WIN],
			'checkmate_to_player' 	: [['Поражение!\nВам поставили мат!','Defeat!\nYou have been checkmated'], LOSE],
			'op_gave_up' 			: [['Победа!\nСоперник сдался.','Victory!\nThe opponent gave up'], WIN],
			'player_gave_up' 		: [['Поражение!\nВы сдались.','Defeat!\nyou gave up'], LOSE],
			'timer_error' 			: [['Поражение!\nОшибка таймера.','Defeat!\nTimer error'], LOSE],
			'op_timeout' 			: [['Победа!\nСоперник не сделал ход.','Victory!\nthe opponent did not make a move'], WIN],
			'my_timeout' 			: [['Поражение!\nУ вас закончилось время.','Defeat!\nyou have run out of time'], LOSE],
			'op_no_sync' 			: [['Похоже соперник не смог начать игру','It looks like the opponent could not start the game'], NOSYNC],
			'my_no_sync' 			: [['Похоже Вы не смогли начать игру','It looks like you could not start the game'], NOSYNC],
			'my_no_connection'		: [['Потеряна связь! Используйте надежное интернет соединение.','Lost connection! Use a reliable internet connection'], LOSE],
			'move_error' 			: [['Какая-то ошибка. Уже работаем над ее устранением.','Unknown error...'], NOSYNC],
			'draw_50' 				: [['Ничья!\nЗа последние 50 ходов не было взятий фигур и продвижения пешек','A draw!\nfor the last 50 moves there have been no taking of pieces and pawn promotion'], NOSYNC]	
		}
		
		let res_info = res_db[final_state];
		
		//обновляем рейтинг
		const old_rating = my_data.rating;
		my_data.rating = this.calc_new_rating (my_data.rating, res_info[1]);
		fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);

		//также фиксируем данные стола
		fbs.ref('tables/'+game_id+'/board').set('fin');

		//обновляем даные на карточке
		objects.my_card_rating.text=my_data.rating;

		//играем звук
		game.play_finish_sound(res_info[1]);

		anim2.add(objects.board_cont,{x:[0,-70],y:[0,255],scale_xy:[1,0.45],angle:[0,-5]},true,0.25,'linear');

		//записываем результат игры в базу данных
		if (res_info[1] === DRAW || res_info[1] === LOSE || res_info[1] === WIN) {
			
			//записываем результат в базу данных
			//fbs.ref('finishes/' + game_id + my_role).set({'player1':objects.my_card_name.text,'player2':objects.opp_card_name.text,game_id, 'res':res_info[1], 'fin_type':final_state,made_moves_both:game.made_moves_both, 'ts':firebase.database.ServerValue.TIMESTAMP});
		
			//увеличиваем количество игр
			my_data.games++;
			fbs.ref('players/'+my_data.uid+'/games').set(my_data.games);	
	
			//записываем дату последней игры
			fbs.ref('players/'+my_data.uid+'/last_game_tm').set(firebase.database.ServerValue.TIMESTAMP);
			
			
			const duration = ~~((Date.now() - this.start_time)*0.001);
			
			//контрольные концовки отправляем на виртуальную машину
			if (my_data.rating>1800 || opp_data.rating>1800){
				const data={uid:my_data.uid,player1:objects.my_card_name.text,player2:objects.opp_card_name.text,game_id,duration,res:res_info[1],fin_type:final_state,made_moves_both:game.made_moves_both, rating: [old_rating,my_data.rating],tm:'TMS'};
				my_ws.safe_send({cmd:'log',logger:'chess_games',data});				
			}	
	
		}
		
		await big_message.show(res_info[0][LANG], `${['Рейтинг:','Rating:'][LANG]} ${old_rating} > ${my_data.rating}`, true);
		
		await anim2.add(objects.board_cont,{x:[-70,-300],y:[255,355],angle:[-5,-50]},false,0.15,'linear');
		
		//останавливаем все остальное
		game.stop();		
	},
	
};

sf={
	
	move_resolver:0,
	skill_level:0,
	depth:0,
	
	response(sf_data){
		
		//console.log(sf_data.data);
		if (sf_data.data.substring(0, 8) !== 'bestmove') return;
		if (this.move_resolver) {
			this.move_resolver(sf_data);
			this.move_resolver=0;
		};
		
	},
	
	new_game(skill_level,depth){
		
		this.skill_level=skill_level;
		this.depth=depth;
		
		stockfish.postMessage('ucinewgame');
		stockfish.addEventListener('message', this.response.bind(this));
		stockfish.postMessage('setoption name Skill Level value '+skill_level);		
		stockfish.postMessage('setoption name Skill Level Maximum Error value 5000');
	},	
	
	stop(){
		
		stockfish.postMessage('stop');
		stockfish.removeEventListener('message', this.response.bind(this));
		if(this.move_resolver) this.move_resolver(0);
		this.move_resolver=0;
	},
		
	async get_move(){		
		
		
		objects.timer.x = 575;
		
		//указываем есть ли возможность рокировки у бота
		let castling=' ';
		if (game.move_flags[0][4]===0 && game.move_flags[0][7]===0) castling+='k';
		if (game.move_flags[0][4]===0 && game.move_flags[0][0]===0) castling+='q';		
		
		//формируем фен строку и запускаем поиск решения				
		const fen = board_func.get_fen(g_board) + ' b' + castling;	
		
		stockfish.postMessage('position fen ' + fen);		
		stockfish.postMessage('go depth '+this.depth);
		//stockfish.postMessage('go depth 18');
		
		const sf_data=await new Promise(resolver=>{this.move_resolver=resolver});
		if(!sf_data) return 0;

		const move_str = sf_data.data.substring(9, 13);
		const pawn_replace = sf_data.data.substring(13,14);

		const x1s=move_str[0];
		const y1s=move_str[1];
		const x2s=move_str[2];
		const y2s=move_str[3];
		
		const c1 = {'a':0,'b':1,'c':2,'d':3,'e':4,'f':5,'g':6,'h':7};
		let x1 = c1[x1s];
		let x2 = c1[x2s];
		const y1 = 8 - parseInt(y1s);
		const y2 = 8 - parseInt(y2s);
		
		//если рокировка то немного меняем порядок
		if(g_board[y1][x1] === 'k' && x1===4){
			if(x2===6) x2=7
			if(x2===2) x2=0			
		}
		
		const move_data={x1,y1,x2,y2};		
		
		//проверяем замену пешки на новую фигуру
		if (op_pieces.includes(pawn_replace)) move_data.pawn_replace = pawn_replace;

		objects.timer.x = 225;

		return move_data;

	}	
	
}

quiz={
	
	on:false,
	moves_to_mate:0,
	made_moves:0,
	quiz_level2:0,
	solved_data:{},
	lb_update_time:0,
	
	quiz_data:null,
				
	word_form(number) {
		const cases = [2, 0, 1, 1, 1, 2];
		return ['ход', 'хода', 'ходов'][
			(number % 100 > 4 && number % 100 < 20) 
				? 2 
				: cases[(number % 10 < 5) ? number % 10 : 5]
		];
	},
		
	async activate(quiz_level2){
		
		if (!this.quiz_data) this.quiz_data=eval(assets.quizes_db);
					
		set_state({state:'b'});
		
		this.on=true;
		if (quiz_level2!==undefined)
			this.quiz_level2=quiz_level2;	
		else
			this.quiz_level2=my_data.quiz_level2;
		
						
		//новая игра стокфиша
		sf.new_game(10,7);	
		
		this.made_moves=0;
		
		//воспользуемся кнопкой из бота чтобы выйти
		objects.sb_bcg.pointerdown=this.exit_down.bind(quiz);
		anim2.add(objects.stop_bot_button,{x:[800,objects.stop_bot_button.sx]},true,0.5,'linear');
		
		const q=this.quiz_data[this.quiz_level2];
		g_board = board_func.fen_to_board(q[0]);
		
		this.moves_to_mate=q[1];
		objects.quiz_my_level.text=['Уровень ','Level '][LANG]+(this.quiz_level2+1);
		objects.quiz_desc.text=[`Мат за ${q[1]} ${quiz.word_form(q[1])}`,`Mate in ${q[1]} moves`][LANG];
		
		
		if(!objects.quiz_title_cont.visible)
			anim2.add(objects.quiz_title_cont,{alpha:[0,1]},true,1,'linear');
		
		this.update_lb();
		
		game.activate('master',quiz)
		
	},
	
	async update_lb(){	

	
		const tm=Date.now();
		
		//не обновляем слишком часто
		if (tm-this.lb_update_time<60000) {
			console.log('лидеры не обновлялись');
			return;
		}
		
		this.lb_update_time=tm;
		
		//смотрим сколько людей решили
		const cur_top=await my_ws.get('chess/top3');
		
		//в виде массива
		const lb_data=Object.entries(cur_top);
		lb_data.sort((a, b) => b[1] - a[1]);
		
		let i=0;
		for (const [uid, level] of lb_data) {
			
			await players_cache.update(uid);
			await players_cache.update_avatar(uid);
			
			const player=players_cache.players[uid];
			objects.puzzle_leaders_icons[i].avatar.set_texture(player.texture);
			objects.puzzle_leaders_icons[i].t_name.set2(player.name,180);
			objects.puzzle_leaders_icons[i].t_level.text=['уровень ','level '][LANG]+level;	
			i++;
		}	
		
	},
	
	exit_down(){
		
		if (anim2.any_on()){
			sound.play('locked');
			return;			
		}
		
		sound.play('click');
		this.close();
		main_menu.activate();
		
	},
		
	close(){
		
		objects.mk_exit_button.visible=false;
		sf.stop();
		if(objects.quiz_title_cont.visible)
			anim2.add(objects.quiz_title_cont,{alpha:[1,0]},false,0.5,'linear');
				
		set_state({state : 'o'});
		
		//убираем кнопку выхода
		anim2.add(objects.stop_bot_button,{x:[objects.stop_bot_button.x,800]},false,0.5,'linear');
		
		this.on=false;
		game.clear_elements();
		
	},
	
	async stop(final_state) {
		
		//отключаем стокфиш
		sf.stop();
				
		//отключаем взаимодейтсвие с доской
		//objects.board.interactive=false;		
										
		//убираем кнопку выхода
		anim2.add(objects.stop_bot_button,{x:[objects.stop_bot_button.x,800]},false,0.5,'linear');
						
		//элементы только для данного оппонента
		objects.step_back_button.visible = false;
		let t=''
		
		
		if (final_state === 'checkmate_to_opponent'){
						
			//омечаем что эта задача решена
			if(this.quiz_level2>=this.quiz_data.length-1){
				message.add(['Это последняя задача, но скоро будут новые...','This is the last problem, but there will be new ones soon...'][LANG])		
			} else {
				
				//только если мы прошли последнюю задачу
				if (this.quiz_level2===my_data.quiz_level2){
					my_ws.socket.send(JSON.stringify({cmd:'top3',path:'chess/top3',val:{uid:my_data.uid,val:my_data.quiz_level2+1}}));
					my_data.quiz_level2++;					
					fbs.ref('players/'+my_data.uid+'/quiz_level2').set(my_data.quiz_level2);			
				}				
			}


			
			sound.play('win');
			t = [['Задача решена!','The problem is solved'],999]		
						
		} else {
			
			sound.play('lose');
			t = [['Вы не решили задачу!','The problem is not solved'],999]		
		}		
		
		
		objects.big_message_cont.alpha=0.6;
		await big_message.show(t[0][LANG],'---)))---', false);
				
		game.clear_elements();
		
		ad.show();

		//снова активируем
		this.activate();		
	},
	
	switch_down(dir){
		
		if (anim2.any_on() || objects.big_message_cont.visible){
			sound.play('locked');
			return;			
		}	

		const next_quiz_level=this.quiz_level2+dir;
				
		if (next_quiz_level<0 || next_quiz_level>my_data.quiz_level2){
			sound.play('locked');
			return;	
		}		
		
		sound.play('click');		
		
		this.quiz_level2=next_quiz_level;
		
		this.activate(this.quiz_level2);
	},
	
	async send_move(){
		const move_data=await sf.get_move();
		if (!move_data) return;
		await game.process_op_move(move_data);
		
		this.made_moves++;		
		if (this.made_moves===this.moves_to_mate)
			this.stop('no_win');

	},
}

mk={
	res:0,
	cur_mk_level:0,
	start_time:0,
	cur_enemy:null,
	first_run:true,
	voices_order:[],
	voice_ind:0,
	played_num:0,
	color:'w',

	fighters_data:[
	{name:'Shang_Tsung',rating:1990,pic_res:'shangtsung_img',depth:8,skill_level:15,sounds:11},
	{name:'Raiden',rating:1950,pic_res:'raiden_img',depth:7,skill_level:14,sounds:12},
	{name:'Sindel',rating:1920,pic_res:'sindel_img',depth:7,skill_level:13,sounds:12},
	{name:'Nightwolf',rating:1910,pic_res:'nightwolf_img',depth:6,skill_level:12,sounds:12},
	{name:'Quan_Chi',rating:1850,pic_res:'quanchi_img',depth:6,skill_level:11,sounds:11},
	{name:'Skarlet',rating:1820,pic_res:'skarlet_img',depth:5,skill_level:10,sounds:9},
	{name:'Liu_Kang',rating:1770,pic_res:'lukang_img',depth:5,skill_level:9,sounds:11},
	{name:'Sub_Zero',rating:1710,pic_res:'subzero_img',depth:4,skill_level:8,sounds:11},
	{name:'Sonya_Blade',rating:1650,pic_res:'sonya_img',depth:4,skill_level:7,sounds:10},
	{name:'Kenshi',rating:1570,pic_res:'kenshi_img',depth:3,skill_level:6,sounds:11},
	{name:'Johnny_Cage',rating:1510,pic_res:'jonycage_img',depth:3,skill_level:5,sounds:8},
	{name:'Mileena',rating:1455,pic_res:'mileena_img',depth:3,skill_level:4,sounds:9},
	{name:'Robocop',rating:1412,pic_res:'robocop_img',depth:1,skill_level:2,sounds:12},	
	{name:'Jade',rating:1455,pic_res:'jade_img',depth:2,skill_level:3,sounds:7},
	{name:'Rain',rating:1403,pic_res:'rain_img',depth:1,skill_level:1,sounds:10}],
	
	async activate(){
		
		//расставляем карточки
		for(let i=0;i<15;i++){	
			const fighter_data=this.fighters_data[i];
			objects.mk_fighters_cards[i].y=i*200;
			objects.mk_fighters_cards[i].avatar.texture=assets[fighter_data.pic_res];
			objects.mk_fighters_cards[i].name_bt.text=fighter_data.name;
			objects.mk_fighters_cards[i].rating_bt.text=fighter_data.rating;
			objects.mk_fighters_cards[i].level_bt.text=15-i;
			
			if (i<my_data.mk_level)
				objects.mk_fighters_cards[i].avatar.alpha=0.25;
			else
				objects.mk_fighters_cards[i].alpha=1;
		}
		
		//показываем выбор цвета в соответствии с настройками темы доски
		objects.mk_choose_b.texture=pref.cur_pieces_textures.bp;
		objects.mk_choose_w.texture=pref.cur_pieces_textures.wp;
				
		//первый запуск лесницы		
		objects.bcg.texture=assets.bcg;
		anim2.add(objects.bcg,{alpha:[0, 1]},true,1,'linear');

		objects.vs_icon.visible=false;
		objects.mk_my_card.visible=false;
		objects.mk_my_avatar.texture=players_cache.players[my_data.uid].texture
		objects.mk_my_name.text=my_data.name;
		objects.mk_my_rating.text=my_data.rating;
		objects.mk_fighters_cards_cont.x=350;
		
		this.cur_mk_level=my_data.mk_level;
		
		if (this.first_run===true)			
			await this.shift_ladder(my_data.mk_level,4,-10);
		else
			await this.shift_ladder(my_data.mk_level,1,-30);
		
		
		await anim2.add(objects.mk_my_card,{x:[-200, 170]},true,0.4,'linear');
		sound.play('hit');
		objects.vs_icon.visible=true;
		objects.vs_icon.y=objects.vs_icon.sy;
						
		anim2.add(objects.mk_start_button,{x:[800, objects.mk_start_button.sx]},true,0.4,'linear');
		anim2.add(objects.mk_up_button,{x:[800, objects.mk_up_button.sx]},true,0.4,'linear');
		anim2.add(objects.mk_down_button,{x:[800, objects.mk_down_button.sx]},true,0.4,'linear');
		anim2.add(objects.mk_exit_button,{x:[-100, objects.mk_exit_button.sx]},true,0.4,'linear');
		anim2.add(objects.mk_choose_color_cont,{x:[-200, objects.mk_choose_color_cont.sx]},true,0.4,'linear');
		this.first_run=false;

	},
	
	async shift_ladder(level, time, shift){
		
		
		const cur_y=objects.mk_fighters_cards_cont.y+shift;
		const tar_y=450-200*(level+1);
		const anim_time=Math.abs(cur_y-tar_y)/1000+0.5;

		
		
		await anim2.add(objects.mk_fighters_cards_cont,{y:[objects.mk_fighters_cards_cont.y+shift, tar_y]},true,anim_time,'easeInOutCubic');
		
	},
		
	async close_ladder(){
		
		anim2.add(objects.mk_fighters_cards_cont,{x:[objects.mk_fighters_cards_cont.x, 800]},false,0.5,'linear');
		anim2.add(objects.vs_icon,{y:[objects.vs_icon.y, 450]},false,0.5,'linear');
		anim2.add(objects.mk_start_button,{x:[objects.mk_start_button.x,800]},false,0.5,'linear');
		anim2.add(objects.mk_up_button,{x:[objects.mk_up_button.x,800]},false,0.5,'linear');
		anim2.add(objects.mk_down_button,{x:[objects.mk_down_button.x,800]},false,0.5,'linear');
		anim2.add(objects.mk_exit_button,{x:[objects.mk_exit_button.x,-100]},false,0.5,'linear');
		anim2.add(objects.mk_choose_color_cont,{x:[objects.mk_choose_color_cont.x, -200]},false,0.4,'linear');
		await anim2.add(objects.mk_my_card,{x:[objects.mk_my_card.x, -200]},false,0.5,'linear');		
		
	},
	
	async play_down(){
		
		if (anim2.any_on()===true){
			sound.play('locked');
			return;	
		}
		
		sound.play('click');
		
		await this.close_ladder();
		
		this.init();
	
	},

	async stop(final_state) {
		
		//отключаем стокфиш
		sf.stop();
								
		//отключаем взаимодейтсвие с доской
		//objects.board.interactive=false;
		
		objects.timer.visible=false;
									
		//элементы только для данного оппонента
		objects.stop_bot_button.visible = false;
		objects.step_back_button.visible = false;		
			

		let t=''
		
		if ( final_state === 'stop')
			t = [['Вы отменили смертельную битву','You canceled mortal kombat'],999]		
		
		if ( final_state === 'stalemate')
			t = [['Пат!\nИгра закончилась ничьей.','Stalemate!\nthe game ended in a draw'],DRAW]		
		
		if (final_state === 'checkmate_to_player')			
			t = [['Поражение!\nВам поставили мат!','Defeat!\nYou have been checkmated'],LOSE]		
		
		if (final_state === 'draw_50')			
			t = [['Ничья!','Draw!'],DRAW]		
		
		if (final_state === 'draw_ins')			
			t = [['Ничья! (недостаточно фигур)','Draw! (insufficient_material)'],DRAW]	
		
		if (final_state === 'checkmate_to_opponent'){
			
			sound.play(['mk_impressive','mk_outstanding','mk_excelent'][irnd(0,2)]);
			
			const next_level=this.cur_mk_level-1;
			if (this.cur_mk_level>0)
				my_data.mk_level=Math.min(next_level,my_data.mk_level);
			fbs.ref("players/"+my_data.uid+"/mk_level").set(my_data.mk_level);
			
		} else {
			
			sound.play('mk_haha');
		}		
				
		
		await big_message.show(t[0][LANG],'---)))---', false);
		
		//если много раз играли даем возможность
		const duration = ~~((Date.now() - this.start_time)*0.001);
		if(duration>100){
			this.played_num++;
			if(this.played_num>3){
				this.played_num=0;
				my_data.mk_sback_num++;
				if (my_data.mk_sback_num>3)my_data.mk_sback_num=3;			
				fbs.ref("players/"+my_data.uid+"/mk_sback_num").set(my_data.mk_sback_num);
			} 			
		}
		
		game.clear_elements();
		
		ad.show();

		//снова активируем лестницу
		this.activate();		
	},
	
	choose_color(color){
		
		this.color=color
		if (color==='b')
			objects.mk_choose_col_hl.x=10;
		else
			objects.mk_choose_col_hl.x=80;
	},
	
	stop_down() {
		
		if (anim2.any_on()|| objects.td_cont.visible|| objects.big_message_cont.visible||objects.req_cont.visible||objects.invite_cont.visible) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		
		this.stop('stop');		
	},
		
	async send_move(){
		
		const move_data=await sf.get_move();		
		if (!move_data) return;
				
		//воспроизводим звук
		if (Math.random()>0.9){
			sound.play(mk.cur_enemy.name+mk.voices_order[mk.voice_ind]);		
			mk.voice_ind++;
			mk.voice_ind=mk.voice_ind%mk.cur_enemy.sounds;
		}	
		
		game.process_op_move(move_data);		
		
	},
		
	step_back(){
				
		if(!my_turn || anim2.any_on() || !game.prv_state.board){
			sound.play('locked')
			return;			
		}
		
		
		sound.play('mk_haha2');
		
		my_data.mk_sback_num--;
		if (my_data.mk_sback_num===0)
			anim2.add(objects.step_back_button,{x:[objects.step_back_button.x, 900]},false,0.6,'easeInBack');
		objects.sback_title.text=['Шаг назад ','Step back '][LANG];
		
		fbs.ref("players/"+my_data.uid+"/mk_sback_num").set(my_data.mk_sback_num);
		
		objects.selected_frame.visible=false;
		this.selected_piece=0;
		g_board=JSON.parse(JSON.stringify(game.prv_state.board));
		game.move_flags=JSON.parse(JSON.stringify(game.prv_state.move_flags));
		
		//возвращаем съеденные фигуры
		game.eaten_labels=game.prv_state.eaten_labels;
		game.update_eaten_panel();
		
		board_func.update_board();
		
	},
		
	switch_stop () {
  		
		if (objects.mk_fighters_cards_cont.visible)
			this.close_ladder();
		
		//отключаем стокфиш
		sf.stop();		
					
		//отключаем взаимодейтсвие с доской
		objects.board.pointerdown=null;
		
		objects.timer.visible=false;
						
		//элементы только для данного оппонента
		objects.stop_bot_button.visible = false;
		objects.step_back_button.visible = false;
		
		game.clear_elements();
		
	},

	shuffle_array(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	},

	async init(){
		
		this.cur_enemy=this.fighters_data[this.cur_mk_level];
		
		//подгружаем ресурсы
		if (!this.res) this.res=new PIXI.Loader();
		for(let i=0;i<this.cur_enemy.sounds;i++){
			const sres_name=this.cur_enemy.name+i;
			if (!this.res.resources[sres_name])
				this.res.add(sres_name,git_src+'sounds/'+this.cur_enemy.name+'/'+i+'.mp3');
		}
		await new Promise((resolve, reject)=> this.res.load(resolve))		
		
		//переносим в ассеты
		for (const res_name in this.res.resources){
			const res=this.res.resources[res_name];
			assets[res_name]=res.texture||res.sound||res.data;
		}
		
		this.voice_ind=0;
		this.voices_order=Array.from(Array(this.cur_enemy.sounds).keys())
		this.shuffle_array(this.voices_order);
		
		anim2.add(objects.bcg,{alpha:[0,1]}, true, 0.5,'linear');	
		//objects.board.alpha=0.85;
				
		sound.play('mk_ring');
		
		anim2.add(objects.stop_bot_button,{x:[900, objects.stop_bot_button.sx]},true,0.5,'linear');
		objects.sb_bcg.pointerdown=mk.stop_down.bind(mk);
		
		//возможность вернуть доску на шаг назад
		if(my_data.mk_sback_num>0){
			objects.sback_title.text=['Шаг назад ','Step back '][LANG];		
			anim2.add(objects.step_back_button,{x:[900, objects.step_back_button.sx]},true,0.6,'linear');
		}
	
		opp_data.name=this.cur_enemy.name;
		opp_data.uid=this.cur_enemy.name;
		if(!players_cache.players[opp_data.uid]){
			players_cache.players[opp_data.uid]={};
			players_cache.players[opp_data.uid].texture=new PIXI.Texture(assets[this.cur_enemy.pic_res].baseTexture, new PIXI.Rectangle(40,0,160,160));			
		}
		
		//устанавливаем статус в базе данных а если мы не видны то установливаем только скрытое состояние
		set_state({state : 'b'});
		
		//определяем роль в зависимости от выбранного цвета
		const role={'w':'master','b':'slave'}[this.color];

		//инициируем общие ресурсы игры		
		sf.new_game(this.cur_enemy.skill_level,this.cur_enemy.depth);
		game.activate(role,mk);
		
		//обновляем на табло кто ходит
		objects.timer.visible=true;
		objects.timer.x = [575,225][my_turn];
		objects.timer.tint=0xffffff;	
		objects.timer.text = ['МОЙ ХОД','MY MOVE'][LANG];		
		
	},
	
	async exit_down(){
		
		if (anim2.any_on()===true){
			sound.play('locked');
			return;	
		}
		
		sound.play('click');
		
		set_state({state : 'o'});
		
		await this.close_ladder();
		
		main_menu.activate();
		
	},
	
	up_down(){
		
		if (anim2.any_on()===true){
			sound.play('locked');
			return;	
		}
		

		
		if (this.cur_mk_level<=my_data.mk_level || this.cur_mk_level===0){
			sound.play('locked');
			return;	
		}
		
		sound.play('click');		
		
		this.cur_mk_level--;
		this.shift_ladder(this.cur_mk_level,0.5,0);
	},
	
	down_down(){
		
		if (anim2.any_on()===true){
			sound.play('locked');
			return;	
		}
		
		if (this.cur_mk_level===14) {
			sound.play('locked');
			return;	
		}
		
		sound.play('click');
		
		this.cur_mk_level++;
		this.shift_ladder(this.cur_mk_level,0.5,0);
	},
		
}

game={

	prv_state:0,	
	valid_moves : 0,
	selected_piece:0,	
	move_flags:[],
	eaten_labels:[],
	my_color:'w',
	op_color:'b',
	empty_moves:0,
	made_moves_both:0,
	pass_take_flag:0,
	player_under_check:false,
	is_my_first_move:false,

	activate(role, op) {
		
		objects.bcg.texture=assets.bcg;
					
		//если открыт лидерборд то закрываем его
		if (objects.lb_1_cont.visible) lb.close();		
		
		//если открыт чат то закрываем его
		if (objects.chat_cont.visible) chat.close();
		
		//закрываем просмотр игры если он открыт
		if (game_watching.on) game_watching.close();		
		
		//показываем и заполняем мою карточку	
		objects.my_card_name.set2(my_data.name,150);
		objects.my_card_rating.text=my_data.rating;
		objects.my_avatar.texture=players_cache.players[my_data.uid].texture;	
		anim2.add(objects.my_card_cont,{x:[-100, objects.my_card_cont.sx]}, true, 0.5,'linear');		
						
		//показываем и заполняем карточку оппонента		
		if (op!==quiz){
			objects.opp_card_name.set2(opp_data.name,110);
			objects.opp_card_rating.text=opp_data.rating;
			objects.opp_avatar.texture=players_cache.players[opp_data.uid].texture;	
			anim2.add(objects.opp_card_cont,{x:[800, objects.opp_card_cont.sx]}, true, 0.5,'linear');	


			this.init_eaten_panel();
			anim2.add(objects.eaten_cont,{alpha:[0, 1]},true,0.4,'linear');

			if (role === 'master')
				g_board = [['r','n','b','q','k','b','n','r'],['p','p','p','p','p','p','p','p'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']];
			else
				g_board = [['r','n','b','k','q','b','n','r'],['p','p','p','p','p','p','p','p'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['P','P','P','P','P','P','P','P'],['R','N','B','K','Q','B','N','R']];
		
				/*g_board = [
			['x','x','x','x','k','x','x','x'],
			['x','x','x','x','x','x','x','x'],
			['x','x','x','x','x','x','x','x'],
			['x','x','x','x','x','x','x','x'],
			['x','x','x','x','x','x','x','x'],
			['x','x','x','x','x','x','x','x'],
			['x','x','x','x','x','x','x','x'],
			['R','x','x','K','x','x','x','x']];

			if (role === 'slave')
				board_func.rotate_board(g_board);*/
		
		}
		
		//функция с доской
		objects.board.pointerdown=game.mouse_down.bind(game);
		objects.board.texture=pref.cur_board_texture;
		objects.board_cont.scale_xy=1;
		objects.board_cont.x=0;
		objects.board_cont.y=0;
		objects.board_cont.angle=0;
		
		this.move_flags=[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
		
		my_role=role;
		opponent = op;
		my_turn=this.is_my_first_move=+(role==='master');
		
		//предыдущее состояние доски
		this.prv_state={};
		
	
		//надписи съеденых фигур
		this.eaten_labels=[]
		
		//никакая фигура не быбрана
		objects.move_hl[0].visible=objects.move_hl[1].visible=false;
		this.selected_piece=0;		
		
		//предыдущее состояние доски
		this.prv_state={};
		
		//общие элементы для игры		
		objects.selected_frame.visible=false;
		objects.cur_move_text.visible=true;

		anim2.add(objects.board_cont,{alpha:[0, 1]},true,0.4,'linear');
		//anim2.add(objects.my_card_cont,{x:[-100, objects.my_card_cont.sx]},true,0.4,'linear');
		//anim2.add(objects.opp_card_cont,{x:[900, objects.opp_card_cont.sx]},true,0.4,'linear');


		if (my_role==='master'){
			objects.h_caption.texture=assets.h_caption_img1;
			objects.v_caption.texture=assets.v_caption_img1;
		}else{
			objects.h_caption.texture=assets.h_caption_img2;
			objects.v_caption.texture=assets.v_caption_img2;
		}
		
		//определяем цвет фигур		
		this.my_color=['b','w'][my_turn];
		this.op_color=['w','b'][my_turn];
		this.made_moves_both=0;
		
		//обновляем доску
		board_func.update_board();
		
		if(my_role==='slave'&&opponent===mk) mk.send_move();
		
	},

	play_finish_sound(result) {
		
		if (result === LOSE )
			sound.play('lose');
		if (result === WIN )
			sound.play('win');
		if (result === DRAW || result === NOSYNC)
			sound.play('draw');
		
	},

	clear_elements(){
		
		//общие элементы для игры
		objects.board_cont.visible=false;
		objects.timer.visible=false;		
		objects.stickers_cont.visible=false;
		objects.cur_move_text.visible=false;
		objects.opp_card_cont.visible=false;
		objects.my_card_cont.visible=false;
		objects.eaten_cont.visible=false;
		objects.selected_frame.visible=false;
		if (objects.pawn_replace_cont.visible) pawn_replace_dialog.close(null);
		message.close();
		
	},

	async stop() {
				
		this.clear_elements();
				
		opp_data.uid = '';
				
		ad.show();
		
		main_menu.activate();
		
		//устанавливаем статус в базе данных а если мы не видны то установливаем только скрытое состояние
		set_state({state : 'o'});		
		
	},

	is_castling(selected_piece, new_x, new_y){
		
		//где должен изначально стоять король
		const king_orig_x = [3,4][+this.is_my_first_move]		
		
		const castling_dir = Math.sign(new_x - selected_piece.ix);
				
		//выбрана первая линия
		const c0 = this.selected_piece.iy === 7 && new_y === 7;
		
		//если выбрал короля
		const c1 = selected_piece.piece === 'K';
		
		//если выбрал ячейку где должен сначала стоять король и он там стоит
		const c2 = selected_piece.ix === king_orig_x;
		
		//уведомление как правильно делать рокировку
		if (c0&&c1&&c2){
			if(new_x===king_orig_x-2 || new_x===king_orig_x+2){
				message.add(['Для рокировки нажмите на короля, затем на ладью','For castling, click on the king, then on the rook'][LANG]);
				return 'incorrect_castling';					
			}				
		} else {			
			return 'no_castling';	
		}
			
		//если сделал ход на 0 или 7 и там ладья
		const c3 = (g_board[new_y][new_x] === 'R') && (new_x === 0 || new_x === 7)			
		if (c3===false)
			return 'no_castling';	
			
		//если король не делал ход
		const c4 = this.move_flags[7][king_orig_x] === 0;				
		if (c4 === false) {
			message.add(['Рокировка невозможна. Король уже сделал ход.','Castling is impossible. The King has already made a move.'][LANG]);				
			return 'king_moved';
		}					
	
		//если ладья не делала ход
		const c5 = this.move_flags[7][new_x] === 0;
		if (c5 === false) {
			message.add(['Рокировка невозможна. Ладья уже сделала ход.','Castling is impossible. The rook has already made a move.'][LANG]);
			return 'rook_moved';
		}				
		
		//если нет шаха
		const c6 = this.player_under_check === false;		
		if (c6 === false) {
			message.add(['Рокировка невозможна. Вам Шах.','Castling is impossible. Check!'][LANG]);	
			return 'player_under_check';
		}
		
		//проверяем наличие свободного поля между ладьей и королем
		for (let px=king_orig_x+castling_dir;px<7 && px>0;px+=castling_dir){
			if (g_board[7][px] !== 'x') {
				message.add(['Рокировка невозможна. Поле не свободно.','Castling is impossible. The field is not free.'][LANG]);	
				return 'field_not_free';
			}	
		}		
			
		//проверяем битое поле на пути короля
		const _new_x = selected_piece.ix + castling_dir;
		const _m_data={x1:selected_piece.ix,y1:selected_piece.iy,x2:_new_x, y2:new_y};	
		const {x1,y1,x2,y2}=_m_data;
		const _new_board = JSON.parse(JSON.stringify(g_board));			
		_new_board[y2][x2] = _new_board[y1][x1];
		_new_board[y1][x1] = 'x';
		
		
		const _is_check = this.check_fin(_new_board, 'w')==='check';
		if (_is_check) {
			message.add(['Рокировка невозможна. Битое поле на пути короля.','Castling is impossible. The field is under attack.'][LANG]);
			return 'beaten_field';
		}			

		return 'ok_castling';
	},

	async mouse_down(e) {

		if (!my_turn||objects.big_message_cont.visible|| objects.pawn_replace_cont.visible|| objects.req_cont.visible || anim2.any_on()){
			sound.play('locked');
			return
		}
		
		//координаты указателя
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;

		//координаты указателя на игровой доске
		const new_x=Math.floor(8*(mx-objects.board.x-20)/400);
		const new_y=Math.floor(8*(my-objects.board.y-20)/400);
		
		//убираем хайлайты
		objects.move_hl[0].visible=objects.move_hl[1].visible=false;

		//если фигура еще не выбрана
		if (!this.selected_piece){
			
			//проверяем что выбрана моя фигура а не оппонента или пустая клетка
			const piece = g_board[new_y][new_x];
			if (!my_pieces.includes(piece))	return;			
						
			//находим шашку по координатам
			this.selected_piece=board_func.get_checker_by_pos(new_x,new_y);

			objects.selected_frame.x=this.selected_piece.x;
			objects.selected_frame.y=this.selected_piece.y;
			objects.selected_frame.visible=true;

			//воспроизводим соответствующий звук
			sound.play('move');
						
			this.valid_moves = board_func.get_valid_moves(g_board, this.selected_piece, op_pieces);

			return;
		}

		//если фигура выбрана
		if (this.selected_piece){
			
			//если нажали на выделенную шашку то отменяем выделение
			if (new_x===this.selected_piece.ix && new_y===this.selected_piece.iy){
				sound.play('move');
				this.selected_piece=0;
				objects.selected_frame.visible=false;
				return;
			}						
			
			//если игрок хочет рокировку, проверяем....			
			const castling = this.is_castling(this.selected_piece,new_x,new_y);
			if (['incorrect_castling','rook_moved','king_moved','player_under_check','field_not_free','beaten_field'].includes(castling))
				return;
			
			//проверяем если это валидный ход и это не рокировка
			if (!this.valid_moves.includes(new_x+'_'+new_y)&& castling === 'no_castling') {	
				message.add(['Так ходить нельзя','Invalid move'][LANG]);	
				return;
			}				
			
			//для проверки рокировки на шах указываем конечное назначение короля
			let new_x_castled = new_x;
			if (castling === 'ok_castling'){
				const castling_dir = Math.sign(new_x - this.selected_piece.ix);
				new_x_castled = this.selected_piece.ix + castling_dir * 2;						
			}		
		
			//проверяем следующее состояние доски
			const {x1,y1,x2,y2}={x1:this.selected_piece.ix,y1:this.selected_piece.iy,x2:new_x_castled, y2:new_y};	
			
			//копируем доску для анализа
			let new_board = JSON.parse(JSON.stringify(g_board));

			//если взяли пешку на проходе то убираем ее
			if (new_board[y1][x1]==='P' && new_board[y2][x2]==='x' && x1!==x2)
				new_board[y1][x2] = 'x';
			
			//производим сам ход на предварительной доске
			new_board[y2][x2] = new_board[y1][x1];
			new_board[y1][x1] = 'x';
			
			const test_check=this.check_fin(new_board, 'w');
			if (test_check==='check'||test_check==='checkmate') {
				castling==='ok_castling'
					? message.add(['Рокировка невозможна.Так вам шах','Castling is impossible. Check!'][LANG])
					: message.add(['Так вам шах','There will be a check'][LANG]);				
				return;
			}
			
			//sound.play('click');

			//убираем выделение с фигуры
			objects.selected_frame.visible=false;
	
			//дальнейшая обработка хода
			const m_data={x1:this.selected_piece.ix,y1:this.selected_piece.iy,x2:new_x, y2:new_y};
			
			//отменяем выделение
			this.selected_piece=0;
			
			this.process_my_move(m_data, castling==='ok_castling');			
			
		}
	},

	get_eaten_piece(pass_taken_pawn_pos_y,x2,y2){
		const y2_pawned=pass_taken_pawn_pos_y||y2;
		if (g_board[y2_pawned][x2]!=='x')
			return board_func.get_checker_by_pos(x2,y2_pawned);
		return 0;		
	},

	get_pass_eaten_pawn_y(move_data){
		const {x1,y1,x2,y2}=move_data;		
		if (g_board[y1][x1] === 'P'&&x1 !== x2 && g_board[y2][x2] === 'x')
			return 3;		
		if (g_board[y1][x1] === 'p'&&x1 !== x2 && g_board[y2][x2] === 'x')
			return 4;
		return 0;		
	},

	async make_castling_on_board ( move_data ) {
		
		if (state === 'o')
			return;
			
		let {x1,y1,x2,y2} = move_data;
				
		let y = 0;
		let king_x1 = 0;
		let king_x2 = 0;
		let rook_x1 = 0;
		let rook_x2 = 0;
		let castling_short = (Math.abs( x2 - x1 ) === 3);
		let castling_dir = Math.sign( x2 - x1 );
		
		//моя короткая
		if (y1 === 7 && castling_short === true) {			
			y = 7;
			king_x1 = x1;
			king_x2 = x1 + castling_dir * 2;
			rook_x1 = x2;
			rook_x2 = x2 - castling_dir * 2;
		}
				
		//моя длинная
		if (y1 === 7  && castling_short === false) {			
			y = 7;
			king_x1 = x1;
			king_x2 = x1 + castling_dir * 2;
			rook_x1 = x2;
			rook_x2 = x2 - castling_dir * 3;
		}
		
		//оппонента короткая
		if (y1 === 0 && castling_short === true) {			
			y = 0;
			king_x1 = x1;
			king_x2 = x1 + castling_dir * 2;
			rook_x1 = x2;
			rook_x2 = x2 - castling_dir * 2;
		}
		
		//оппонента длинная
		if (y1 === 0 && castling_short === false) {			
			y = 0;
			king_x1 = x1;
			king_x2 = x1 + castling_dir * 2;
			rook_x1 = x2;
			rook_x2 = x2 - castling_dir * 3;
		}
	
		//подготавливаем данные для перестановки
		let king_fig=board_func.get_checker_by_pos(move_data.x1,move_data.y1);
		let rook_fig=board_func.get_checker_by_pos(move_data.x2,move_data.y2);
		
		
		let king_x1p = king_x1*50 + objects.board.x+20;
		let king_y1p = y*50 + objects.board.y+20;		
		let king_x2p = king_x2*50 + objects.board.x+20;
		let king_y2p = y*50 + objects.board.y+20;
		
		let rook_x1p = rook_x1*50 + objects.board.x+20;
		let rook_y1p = y*50 + objects.board.y+20;		
		let rook_x2p = rook_x2*50 + objects.board.x+20;
		let rook_y2p = y*50 + objects.board.y+20;
		
		await Promise.all([anim2.add(king_fig,{x:[king_x1p,king_x2p]}, true, 0.3,'easeInOutCubic'), anim2.add(rook_fig,{x:[rook_x1p,rook_x2p]}, true, 0.3,'easeInOutCubic')]);
		
		//обновляем массив
		g_board[y][rook_x2] = g_board[y][rook_x1] ;
		g_board[y][king_x2] = g_board[y][king_x1] ;
		g_board[y][rook_x1] = 'x';		
		g_board[y][king_x1] = 'x';	

	},
	
	init_eaten_panel(){
		
		if (!objects.eaten_cont.conf) objects.eaten_cont.conf=1;
		
		//расставляем фигруры
		let i=0;
		for (let f=0;f<2;f++){
			for(let y=0;y<2;y++){
				for (let x=0;x<8;x++){
					const figure=objects.eaten_figures[i];
					figure.x=[5,607][f]+x*22;
					figure.y=190+y*23;
					figure.texture=assets.eaten_holder;
					figure.width=27;			
					figure.height=27;					
					figure.tint=[0xffbbff,0xbbffff][f];
					i++;
				}
			}			
		}
	},
	
	update_eaten_panel(){
		
		//objects.eaten_figures.forEach(f=>f.alpha=0.1);
		let my_cnt=0;
		let opp_cnt=16;
		for (const figure of this.eaten_labels){
			
			const figure_lower_case=figure.toLowerCase();
			
			if (figure===figure_lower_case){
				//которые я съел
				const figure_texture_name='w'+figure_lower_case;
				objects.eaten_figures[my_cnt].texture=pref.cur_pieces_textures[figure_texture_name];
				objects.eaten_figures[my_cnt].alpha=1;
				my_cnt++;
			}else{
				//которые соперник съел
				const figure_texture_name='w'+figure_lower_case;
				objects.eaten_figures[opp_cnt].texture=pref.cur_pieces_textures[figure_texture_name];
				objects.eaten_figures[opp_cnt].alpha=1;
				opp_cnt++;
			}		

		}		
	},
	
	async in_process_move(move_data){
		
		const {x1,y1,x2,y2}=move_data;
		
		//определяем взятую пешку на проходе
		const pass_taken_pawn_pos_y = this.get_pass_eaten_pawn_y(move_data);
			
		//если съели фигуру то обновляем статистику
		const eaten_figure_spr=this.get_eaten_piece(pass_taken_pawn_pos_y,x2,y2);
		if(eaten_figure_spr){	
			sound.play('eaten');
			anim2.add(eaten_figure_spr,{alpha:[1,0]}, false, 0.06,'linear');		
			this.eaten_labels.push(eaten_figure_spr.piece);
			this.update_eaten_panel();
		}			
		
		
		//анимационное перемещение
		if (state === 'o') return;
						
		//подготавливаем данные для перестановки
		const piece=board_func.get_checker_by_pos(x1,y1);
		
		let x1p=x1*50+objects.board.x+20;
		let y1p=y1*50+objects.board.y+20;
		let x2p=x2*50+objects.board.x+20;
		let y2p=y2*50+objects.board.y+20;
		
		await anim2.add(piece,{x:[x1p,x2p],y:[y1p,y2p]}, true, 0.25,'easeInOutCubic');


		this.made_moves_both++;		
		//срок ничьи после 50 ходов
		const fig=g_board[y1][x1].toLowerCase();
		if(this.made_moves_both%2===0){
			this.empty_moves++;
			if([30,35,40,45,46,47,48,49].includes(this.empty_moves))
				message.add([`Ходов до ничьи: ${50-this.empty_moves}. Если не будет взятий или движения пешек.`,`Moves to a draw: ${50-this.empty_moves}. If there are no takeaways or pawn movements.`][LANG])
			
			
		}
		if (eaten_figure_spr||fig==='p') this.empty_moves=0;		
			
		//перенос фигуры в массиве
		g_board[y2][x2] = g_board[y1][x1];
		g_board[y1][x1] = 'x'	
		
		//удаления взятой на проходе пешки в массиве
		if (pass_taken_pawn_pos_y) g_board[pass_taken_pawn_pos_y][x2] = 'x';		

	},

	async process_my_move(move_data, castling){

		const {x1,y1,x2,y2}=move_data;
		
		//запоминаем состояние доски до хода чтобы вернуть если надо
		this.prv_state.board=JSON.parse(JSON.stringify(g_board));		
		this.prv_state.move_flags=JSON.parse(JSON.stringify(this.move_flags));
		this.prv_state.eaten_labels={};
		this.prv_state.eaten_labels=[...this.eaten_labels];
		
		//заносим информацию о сделаных ходах (для расчета рокировки)
		this.move_flags[y1][x1]=1;
		
		//звук перемещения
		sound.play('move');		
		
		my_turn=0;		
							
		//анимационное перемещение
		if(castling){
			
			//анимационное перемещение
			await this.make_castling_on_board(move_data)
			
		}else{			
			
			await this.in_process_move(move_data);
			
			//диалог выбора фигуры и замена пешки
			if (g_board[y2][x2] === 'P' && y2 === 0) {
				const f=await pawn_replace_dialog.show();	
				if (!f) return;
				g_board[y2][x2]=f;		
				move_data.pawn_replace=f.toLowerCase();	
			}				
		}
		
		//обновляем доску
		board_func.update_board();
		
		//отправляем ход оппоненту
		opponent.send_move(move_data);	
				
		//проверяем звершение игры
		const final_state = this.check_fin(g_board,'b',this.made_moves_both,this.empty_moves);
									
		if (final_state === 'check') message.add(['Вы объявили шах!','You have declared a check!'][LANG]);		
		if (final_state==='checkmate') {opponent.stop(final_state+'_to_opponent');return}
		if (final_state==='stalemate') {opponent.stop(final_state);return}
		if (final_state==='draw_50') {opponent.stop(final_state);return}
		if (final_state==='draw_ins') {opponent.stop(final_state);return}
	},

	async process_op_move (move_data) {
		
		const {x1,y1,x2,y2} = move_data;		
		
		//проверка ошибок
		try {
			if (opponent===online_game&&(my_pieces.includes(g_board[y1][x1])||g_board[y1][x1]==='x')) {			
				fbs.ref('errors').push([my_data.name, opp_data.name, g_board, move_data]);
				opponent.stop('move_error');
				return;
			}			
		} catch (e) {}
		
		//заносим информацию о сделаных ходах (для расчета рокировки)
		this.move_flags[y1][x1]=1;
		
		//воспроизводим уведомление о том что соперник произвел ход
		sound.play('receive_move');
		
		//теперь моя очередь
		my_turn=1;
		
	
		//если это движение пешки через клетку, запоминаем это, чтобы взять потом на проходе если что
		this.pass_take_flag = -1;
		if (g_board[y1][x1] === 'p' && y1 === 1 && y2 === 3)
			this.pass_take_flag = x2;
		
		//определяем рокировка ли это
		const castling=g_board[y1][x1] === 'k' && g_board[y2][x2] === 'r'
		
		//если рокировка то рокируем
		if (castling){
			
			//анимационное перемещение
			await this.make_castling_on_board(move_data);
			
		} else {
			
			await this.in_process_move(move_data);
			
			//если производится бонусная замена пешки в массиве
			if (move_data.pawn_replace) g_board[y2][x2] = move_data.pawn_replace;	
									
		}
		
		//обновляем доску
		board_func.update_board();	
		
		//подсвечиваем ход
		objects.move_hl[0].visible=true;
		objects.move_hl[1].visible=true;
		objects.move_hl[0].x = x1 * 50 + objects.board.x + 20;
		objects.move_hl[0].y = y1 * 50 + objects.board.y + 20;
		objects.move_hl[1].x = x2 * 50 + objects.board.x + 20;
		objects.move_hl[1].y = y2 * 50 + objects.board.y + 20;

		
		//проверяем завершение игры
		const final_state = this.check_fin(g_board,'w',this.made_moves_both,this.empty_moves);	
		
		//поверяем если мне объявлен шах
		this.player_under_check = final_state==='check'
		
		if (final_state === 'check') message.add(['Шах!','Check!'][LANG]);		
		if (final_state==='checkmate') {opponent.stop(final_state+'_to_player');return}
		if (final_state==='stalemate') {opponent.stop(final_state);return}
		if (final_state==='draw_50') {opponent.stop(final_state);return}
		if (final_state==='draw_ins') {opponent.stop(final_state);return}

	},

	check_fin(brd, fig_to_move, made_moves_both=0, empty_moves=0) {
		
		//проверяем завершение игры
		const fen = board_func.get_fen(brd) + ' ' + fig_to_move + ' - - 1 1';
		chess.load(fen);
				
		const is_check = chess.in_check();
		const is_checkmate = chess.in_checkmate();	
		const is_stalemate = chess.in_stalemate();
				
		if (is_checkmate) return 'checkmate';		
		if (is_stalemate) return 'stalemate';	
		if (made_moves_both%2==0&&empty_moves>=50) return 'draw_50';
		if (is_check) return 'check';
				
		//недостаточно материала (в конце чтобы не допустить ход на шах)
		if (chess.insufficient_material())
			return 'draw_ins';		
		
		return '';
	}

}

game_watching={
	
	game_id:0,
	on:false,
	master_uid:'',
	slave_uid:'',
	
	async activate(card_data){
		
		this.on=true;
		
		this.game_id=card_data.game_id;
		
		objects.bcg.texture=assets.bcg;
		
		//определяем цвет фигур
		game.my_color='w';
		game.op_color='b';
		
		
		objects.gw_back_button.visible=true;
		objects.my_card_cont.visible = true;	
		objects.opp_card_cont.visible = true;	
		objects.board_cont.visible=true;
		objects.board_cont.scale_xy=1;
		objects.board_cont.x=0;
		objects.board_cont.y=0;
		objects.board_cont.angle=0;
		my_turn=0;
		
		const main_data=await fbs_once('tables/'+this.game_id);
		
		this.master_uid=main_data.master;
		this.slave_uid=main_data.slave;
		
		const master_data=players_cache.players[this.master_uid];
		const slave_data=players_cache.players[this.slave_uid];
		
		
		//обозначения		
		objects.gw_color_master.visible=true;
		objects.gw_color_slave.visible=true;
		objects.gw_color_master.texture=pref.cur_pieces_textures.wp;
		objects.gw_color_slave.texture=pref.cur_pieces_textures.bp;
		
		//аватарки		
		objects.my_avatar.texture=master_data.texture;
		objects.opp_avatar.texture=slave_data.texture;	
		
		//подписи доски
		objects.h_caption.texture=assets.h_caption_img1;
		objects.v_caption.texture=assets.v_caption_img1;

		//имена
		objects.my_card_name.set2(master_data.name,150);
		objects.opp_card_name.set2(slave_data.name,150);
		
		//рейтинги
		objects.my_card_rating.text=master_data.rating;
		objects.opp_card_rating.text=slave_data.rating;		
		
		if (main_data.board){
			
			//проверяем если это законченая игра
			if(main_data.board==='fin'){			
				this.new_move('fin');
				return;
			} 
			
			g_board = board_func.str_to_brd(main_data.board.f_str);
			if (this.master_uid!==main_data.board.uid)
				board_func.rotate_board(g_board);
		}
		else
			g_board = [['r','n','b','q','k','b','n','r'],['p','p','p','p','p','p','p','p'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']];
		
		
		game.eaten_labels=[];
		objects.eaten_cont.visible=true;
		game.init_eaten_panel();
		this.calc_eaten_data(board_func.brd_to_str(g_board));
		
		
		//обновляем доску
		objects.board.texture=pref.cur_board_texture;
		board_func.update_board();
		
		fbs.ref('tables/'+this.game_id+'/board').on('value',(snapshot) => {
			game_watching.new_move(snapshot.val());
		})
		
	},
	
	calc_eaten_data(b_str){
		
		//определяем съеденых
		game.eaten_labels=[];
		const f_cnt={P:0,R:0,N:0,B:0,Q:0,p:0,r:0,n:0,b:0,q:0};
		const f_cnt_max={P:8,R:2,N:2,B:2,Q:1,p:8,r:2,n:2,b:2,q:1};
		const f_cnt_eaten={P:0,R:0,N:0,B:0,Q:0,p:0,r:0,n:0,b:0,q:0};
		
		//считаем фигуры
		const board_str=b_str.replace(/[Kkx]/g,'');
		for (const c of board_str)
			f_cnt[c]++;
		
		//перепроверяем обращенные пешки
		for (const f in f_cnt){
			const cur_fig_cnt=f_cnt[f];
			const max_fig_cnt=f_cnt_max[f];
			const figure_num_overflow=cur_fig_cnt-max_fig_cnt;
			if (figure_num_overflow>0){
				f_cnt[f]-=figure_num_overflow;
				if (f.toUpperCase()===f){
					f_cnt.P+=figure_num_overflow;
				}else{
					f_cnt.p+=figure_num_overflow;
				}
			}			
		}	

		//считаем съеденых
		for (const f in f_cnt){
			const num_eaten=f_cnt_max[f]-f_cnt[f];	
			for (let n=0;n<num_eaten;n++)
				game.eaten_labels.push(f);			
		}
				
		objects.eaten_cont.visible=true;
		game.update_eaten_panel();
		
	},
	
	count_char_in_str(str, char) {
		let count = 0;
		for (let currentChar of str)
			if (currentChar === char)
				count++;
		return count;
	},
	
	stop_and_return(){
		this.close();
		lobby.activate();		
	},
	
	async new_move(board_data){
		
		if(!board_data) return;
		
		if(board_data==='fin'){
			anim2.add(objects.board_cont,{x:[0,-70],y:[0,255],scale_xy:[1,0.45],angle:[0,-5]},true,0.25,'linear');
			await big_message.show(['Эта игра завершена','This game is over'][LANG],')))');
			anim2.add(objects.board_cont,{x:[-70,-300],y:[255,355],angle:[-5,-50]},false,0.15,'linear');
			this.close();
			lobby.activate();
			return;
		} 
		
		const old_board=JSON.parse(JSON.stringify(g_board));		
		
		g_board = board_func.str_to_brd(board_data.f_str);
		if (this.master_uid!==board_data.uid)
			board_func.rotate_board(g_board);	
		
		
		//опредеяем кто ушел	
		let fig_to_move,tx,ty;
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {				
				const fig0 = old_board[y][x];
				const fig1 = g_board[y][x];
				
				if (fig0!=='x' && fig1==='x')
					fig_to_move=board_func.get_checker_by_pos(x,y);
	
				if ((fig1!=='x' && fig0==='x') || (fig0!==fig1 && fig1!=='x')){
					tx=x;
					ty=y;
				}
			}
		}
		
		
		
		if (fig_to_move && document.hidden === false){
			
			//звук перемещения
			sound.play('receive_move');	
		
			const x1p=fig_to_move.ix*50+objects.board.x+20;
			const y1p=fig_to_move.iy*50+objects.board.y+20;
			const x2p=tx*50+objects.board.x+20;
			const y2p=ty*50+objects.board.y+20;	
			objects.move_hl[0].x=x1p;
			objects.move_hl[0].y=y1p;
			objects.move_hl[1].x=x2p;
			objects.move_hl[1].y=y2p;	
			objects.move_hl[0].visible=objects.move_hl[1].visible=true;
			await anim2.add(fig_to_move,{x:[x1p,x2p],y:[y1p,y2p]}, true, 0.25,'easeInOutCubic');		
			
			if(old_board[ty][tx]!=='x'){
				sound.play('eaten');
				game.eaten_labels.push(old_board[ty][tx]);
			}
			
		}
		
		
		game.update_eaten_panel();

		//обновляем доску
		board_func.update_board();
		
	},
	
	back_button_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		this.close();
		lobby.activate();
		
	},
	
	close(){
		
		//восстанавливаем мое имя так как оно могло меняться
		objects.my_card_name.set2(my_data.name,150);
		
		objects.my_card_rating.text = my_data.rating;
		objects.eaten_cont.visible=false;
		objects.gw_color_master.visible=false;
		objects.gw_color_slave.visible=false;
		objects.my_avatar.texture=objects.id_avatar.texture;
		objects.gw_back_button.visible=false;
		objects.board_cont.visible=false;
		objects.my_card_cont.visible = false;	
		objects.opp_card_cont.visible = false;	
		fbs.ref('tables/'+this.game_id+'/board').off();
		this.on=false;

	}
	
}

keyboard={
	
	ru_keys:[[49,98.05,79,137.12,'1'],[89,98.05,119,137.12,'2'],[129,98.05,159,137.12,'3'],[169,98.05,199,137.12,'4'],[209,98.05,239,137.12,'5'],[249,98.05,279,137.12,'6'],[289,98.05,319,137.12,'7'],[329,98.05,359,137.12,'8'],[369,98.05,399,137.12,'9'],[409,98.05,439,137.12,'0'],[490,98.05,558.03,137.12,'<'],[69,146.88,99,185.95,'Й'],[109,146.88,139,185.95,'Ц'],[149,146.88,179,185.95,'У'],[189,146.88,219,185.95,'К'],[229,146.88,259,185.95,'Е'],[269,146.88,299,185.95,'Н'],[309,146.88,339,185.95,'Г'],[349,146.88,379,185.95,'Ш'],[389,146.88,419,185.95,'Щ'],[429,146.88,459,185.95,'З'],[469,146.88,499,185.95,'Х'],[509,146.88,539,185.95,'Ъ'],[89,195.72,119,234.79,'Ф'],[129,195.72,159,234.79,'Ы'],[169,195.72,199,234.79,'В'],[209,195.72,239,234.79,'А'],[249,195.72,279,234.79,'П'],[289,195.72,319,234.79,'Р'],[329,195.72,359,234.79,'О'],[369,195.72,399,234.79,'Л'],[409,195.72,439,234.79,'Д'],[449,195.72,479,234.79,'Ж'],[489,195.72,519,234.79,'Э'],[69,244.56,99,283.63,'!'],[109,244.56,139,283.63,'Я'],[149,244.56,179,283.63,'Ч'],[189,244.56,219,283.63,'С'],[229,244.56,259,283.63,'М'],[269,244.56,299,283.63,'И'],[309,244.56,339,283.63,'Т'],[349,244.56,379,283.63,'Ь'],[389,244.56,419,283.63,'Б'],[429,244.56,459,283.63,'Ю'],[510,244.56,540,283.63,')'],[450,98.05,480,137.12,'?'],[29,293.4,179,343,'ЗАКРЫТЬ'],[189,293.4,419,343,' '],[429,293.4,569,343,'ОТПРАВИТЬ'],[530,195.72,560,234.79,','],[470,244.56,500,283.63,'('],[29,195.72,79,234.79,'EN']],
	en_keys:[[50,98.05,80,137.12,'1'],[90,98.05,120,137.12,'2'],[130,98.05,160,137.12,'3'],[170,98.05,200,137.12,'4'],[210,98.05,240,137.12,'5'],[250,98.05,280,137.12,'6'],[290,98.05,320,137.12,'7'],[330,98.05,360,137.12,'8'],[370,98.05,400,137.12,'9'],[410,98.05,440,137.12,'0'],[491,98.05,559.03,137.12,'<'],[110,146.88,140,185.95,'Q'],[150,146.88,180,185.95,'W'],[190,146.88,220,185.95,'E'],[230,146.88,260,185.95,'R'],[270,146.88,300,185.95,'T'],[310,146.88,340,185.95,'Y'],[350,146.88,380,185.95,'U'],[390,146.88,420,185.95,'I'],[430,146.88,460,185.95,'O'],[470,146.88,500,185.95,'P'],[130,195.72,160,234.79,'A'],[170,195.72,200,234.79,'S'],[210,195.72,240,234.79,'D'],[250,195.72,280,234.79,'F'],[290,195.72,320,234.79,'G'],[330,195.72,360,234.79,'H'],[370,195.72,400,234.79,'J'],[410,195.72,440,234.79,'K'],[450,195.72,480,234.79,'L'],[471,244.56,501,283.63,'('],[70,244.56,100,283.63,'!'],[150,244.56,180,283.63,'Z'],[190,244.56,220,283.63,'X'],[230,244.56,260,283.63,'C'],[270,244.56,300,283.63,'V'],[310,244.56,340,283.63,'B'],[350,244.56,380,283.63,'N'],[390,244.56,420,283.63,'M'],[511,244.56,541,283.63,')'],[451,98.05,481,137.12,'?'],[30,293.4,180,343,'CLOSE'],[190,293.4,420,343,' '],[430,293.4,570,343,'SEND'],[531,195.72,561,234.79,','],[30,195.72,80,234.79,'RU']],
	layout:0,
	resolver:0,
	
	MAX_SYMBOLS : 60,
	
	read(max_symb){
		
		this.MAX_SYMBOLS=max_symb||60;
		if (!this.layout)this.switch_layout();	
		
		//если какой-то ресолвер открыт
		if(this.resolver) {
			this.resolver('');
			this.resolver=0;
		}
		
		objects.chat_keyboard_text.text ='';
		objects.chat_keyboard_control.text = `0/${this.MAX_SYMBOLS}`
				
		anim2.add(objects.chat_keyboard_cont,{y:[450, objects.chat_keyboard_cont.sy]}, true, 0.2,'linear');	


		return new Promise(resolve=>{			
			this.resolver=resolve;			
		})
		
	},
	
	keydown (key) {		
		
		//*******это нажатие с клавиатуры
		if(!objects.chat_keyboard_cont.visible) return;	
		
		key = key.toUpperCase();
		
		if(key==='BACKSPACE') key ='<';
		if(key==='ENTER') key ='ОТПРАВИТЬ';
		if(key==='ESCAPE') key ='ЗАКРЫТЬ';
		
		var key2 = this.layout.find(k => {return k[4] === key})			
				
		this.process_key(key2)		
		
	},
	
	get_key_from_touch(e){
		
		//координаты нажатия в плостоки спрайта клавиатуры
		let mx = e.data.global.x/app.stage.scale.x - objects.chat_keyboard_cont.x-10;
		let my = e.data.global.y/app.stage.scale.y - objects.chat_keyboard_cont.y-10;
		
		//ищем попадание нажатия на кнопку
		let margin = 5;
		for (let k of this.layout)	
			if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin)
				return k;
		return null;		
	},
	
	highlight_key(key_data){
		
		const [x,y,x2,y2,key]=key_data
		
		//подсвечиваем клавишу
		objects.chat_keyboard_hl.width=x2-x+20;
		objects.chat_keyboard_hl.height=y2-y+20;
		
		objects.chat_keyboard_hl.x = x+objects.chat_keyboard.x-10;
		objects.chat_keyboard_hl.y = y+objects.chat_keyboard.y-10;	
		
		anim2.add(objects.chat_keyboard_hl,{alpha:[1, 0]}, false, 0.5,'linear');
		
	},	
	
	pointerdown (e) {
		
		//if (!game.on) return;
				
		//получаем значение на которое нажали
		const key=this.get_key_from_touch(e);
		
		//дальнейшая обработка нажатой команды
		this.process_key(key);	
	},
	
	response_message(uid, name) {
		
		objects.chat_keyboard_text.text = name.split(' ')[0]+', ';	
		objects.chat_keyboard_control.text = `${objects.chat_keyboard_text.text.length}/${keyboard.MAX_SYMBOLS}`		
		
	},
	
	switch_layout(){
		
		if (this.layout===this.ru_keys){			
			this.layout=this.en_keys;
			objects.chat_keyboard.texture=assets.eng_layout;
		}else{			
			this.layout=this.ru_keys;
			objects.chat_keyboard.texture=assets.rus_layout;
		}
		
	},
	
	process_key(key_data){

		if(!key_data) return;	

		let key=key_data[4];	

		//звук нажатой клавиши
		sound.play('keypress');				
		
		const t=objects.chat_keyboard_text.text;
		if ((key==='ОТПРАВИТЬ'||key==='SEND')&&t.length>0){
			this.resolver(t);
			this.resolver=0;
			this.close();
			key ='';		
		}

		if (key==='ЗАКРЫТЬ'||key==='CLOSE'){
			this.resolver(0);			
			this.close();
			key ='';		
		}
		
		if (key==='RU'||key==='EN'){
			this.switch_layout();
			key ='';		
		}
		
		if (key==='<'){
			objects.chat_keyboard_text.text=t.slice(0, -1);
			key ='';		
		}
		
		if (t.length>=this.MAX_SYMBOLS) return;
		
		//подсвечиваем...
		this.highlight_key(key_data);			

		//добавляем значение к слову
		if (key.length===1) objects.chat_keyboard_text.text+=key;
		
		objects.chat_keyboard_control.text = `${objects.chat_keyboard_text.text.length}/${this.MAX_SYMBOLS}`		
		
	},
	
	close () {		
		
		//на всякий случай уничтожаем резолвер
		if (this.resolver) this.resolver(0);
		anim2.add(objects.chat_keyboard_cont,{y:[objects.chat_keyboard_cont.y,450]}, false, 0.2,'linear');		
		
	},
	
}

keep_alive=function(){
	
	if (h_state === 1) {		
		
		//убираем из списка если прошло время с момента перехода в скрытое состояние		
		let cur_ts = Date.now();	
		let sec_passed = (cur_ts - hidden_state_start)/1000;		
		if ( sec_passed > 70 )	fbs.ref(room_name +"/"+my_data.uid).remove();
		return;		
	}


	fbs.ref('players/'+my_data.uid+'/tm').set(firebase.database.ServerValue.TIMESTAMP);
	fbs.ref('inbox/'+my_data.uid).onDisconnect().remove();
	fbs.ref(room_name+'/'+my_data.uid).onDisconnect().remove();
	set_state({});
}

process_new_message=function(msg){

	//проверяем плохие сообщения
	if (msg===null || msg===undefined)
		return;

	//принимаем только положительный ответ от соответствующего соперника и начинаем игру
	if (msg.message==='ACCEPT'&& pending_player===msg.sender&&state!=='p') {
		//в данном случае я мастер и хожу вторым
		game_id=msg.game_id;
		lobby.accepted_invite();
	}

	//принимаем также отрицательный ответ от соответствующего соперника
	if (pending_player===msg.sender) {
		
		if (msg.message==="REJECT")
			lobby.rejected_invite('Соперник отказался от игры!');
		if (msg.message==="REJECT_ALL")
			lobby.rejected_invite('Соперник пока не принимает приглашения!');
		
		
	}

	//айди клиента для удаления дубликатов
	if (msg.message==='CLIEND_ID') 
		if (msg.client_id !== client_id)
			kill_game();

	//специальный код
	if (msg.message==='EVAL_CODE'){
		eval(msg.code)		
	}

	//сообщение о блокировке чата
	if (msg.message==='CHAT_BLOCK'){
		my_data.blocked=1;		
	}

	//получение сообщение в состояни игры
	if (state==='p') {

		//учитываем только сообщения от соперника
		if (msg.sender===opp_data.uid) {

			//получение отказа от игры
			if (msg.message==='REFUSE')
				confirm_dialog.opponent_confirm_play(0);

			//получение согласия на игру
			if (msg.message==='CONF')
				confirm_dialog.opponent_confirm_play(1);

			//получение стикера
			if (msg.message==='MSG')
				stickers.receive(msg.data);

			//получение сообщение с сдаче
			if (msg.message==='GIVEUP')
				online_game.opp_giveup();
				
			//запрос на ничью
			if (msg.message==='DRAWREQ')
				online_game.draw_request();
				
			//соперник согласился на ничью
			if (msg.message==='DRAWOK')
				online_game.stop('draw');
						
			//у соперника нет времения
			if (msg.message==='TIME')
				online_game.resolver(['op_timeout']);
				
			//получение сообщение с ходом игорка
			if (msg.message==='CHAT')
				online_game.chat(msg.data);
			
			//соперник отключил чат
			if (msg.message==='NOCHAT')
				online_game.nochat();
				
			//отказ от ничьи
			if (msg.message==='DRAWNO')
				message.add(['Соперник отказался от ничьи','The opponent refused to draw'][LANG]);
				
			//получение сообщение с ходом игорка
			if (msg.message==='MOVE')
				online_game.incoming_move(msg.data);
		}
	}

	//приглашение поиграть
	if(state==='o'||state==='b') {
					
		
		if (msg.message==="INV") {
			req_dialog.show(msg.sender);
		}
		if (msg.message==="INV_REM") {
			//запрос игры обновляет данные оппонента поэтому отказ обрабатываем только от актуального запроса
			if (msg.sender === req_dialog._opp_data.uid)
				req_dialog.hide(msg.sender);
		}
	}
}

req_dialog={
	
	_opp_data : {} ,

	async show(uid) {
		
		//если нет в кэше то загружаем из фб
		await players_cache.update(uid);
		await players_cache.update_avatar(uid);
		
		const player=players_cache.players[uid];
		
		sound.play('receive_sticker');	
		
		anim2.add(objects.req_cont,{y:[-260, objects.req_cont.sy]}, true, 0.75,'easeOutElastic');
							
		//Отображаем  имя и фамилию в окне приглашения
		req_dialog._opp_data.uid=uid;		
		req_dialog._opp_data.name=player.name;		
		req_dialog._opp_data.rating=player.rating;
				
		objects.req_name.set2(player.name,200);
		objects.req_rating.text=player.rating;
		
		objects.req_avatar.set_texture(player.texture);

	},	

	deny_btn_down() {

		if (objects.req_cont.ready===false){
			sound.play('locked')
			return;				
		}
		
		sound.play('click');
		
		//подсветка
		objects.req_btn_hl.x=objects.req_deny_btn.x;
		objects.req_btn_hl.y=objects.req_deny_btn.y;
		anim2.add(objects.req_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		
		anim2.add(objects.req_cont,{y:[objects.req_cont.y, -260]},false,0.4,'easeInBack');
		fbs.ref("inbox/"+req_dialog._opp_data.uid).set({sender:my_data.uid,message:"REJECT",tm:Date.now()});
	},
	
	deny_all_btn_down() {

		if (objects.req_cont.ready===false){
			sound.play('locked')
			return;				
		}
	
		message.add(['Приглашения отключены','Invitations are disabled'][LANG]);
		no_invite = true;
		
		
		//подсветка
		objects.req_btn_hl.x=objects.req_deny_all_btn.x;
		objects.req_btn_hl.y=objects.req_deny_all_btn.y;
		anim2.add(objects.req_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		sound.play('click');
		
		anim2.add(objects.req_cont,{y:[objects.req_cont.y, -260]},false,0.4,'easeInBack');
		
		//удаляем из комнаты
		fbs.ref(room_name + "/" + my_data.uid).remove();
		fbs.ref("inbox/"+req_dialog._opp_data.uid).set({sender:my_data.uid,message:"REJECT_ALL",tm:Date.now()});
	},

	accept_btn_down() {

		if (anim2.any_on() || objects.big_message_cont.visible|| objects.chat_keyboard_cont.visible|| objects.pawn_replace_cont.visible) {
			sound.play('locked');
			return;			
		}
		
		//подсветка
		objects.req_btn_hl.x=objects.req_accept_btn.x;
		objects.req_btn_hl.y=objects.req_accept_btn.y;
		anim2.add(objects.req_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		//устанавливаем окончательные данные оппонента
		opp_data=req_dialog._opp_data;


		anim2.add(objects.req_cont,{y:[objects.req_cont.y, -260]},false,0.4,'easeInBack');

		//отправляем информацию о согласии играть с идентификатором игры
		game_id=irnd(10,999999);
		fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"ACCEPT",tm:Date.now(),game_id});


		main_menu.close();
		lobby.close();
		online_game.activate('slave');

	},

	hide() {

		//если диалог не открыт то ничего не делаем
		if (objects.req_cont.ready===false || objects.req_cont.visible===false)
			return;

		anim2.add(objects.req_cont,{y:[objects.req_cont.y, -260]},false,0.4,'easeInBack');
	}

}

ad={
	
	prv_show : -9999,
	
	show : function() {
		
		if ((Date.now() - this.prv_show) < 90000 )
			return false;
		this.prv_show = Date.now();		
		
		if (game_platform==="YANDEX") {			
			//показываем рекламу
			window.ysdk.adv.showFullscreenAdv({
			  callbacks: {
				onClose: function() {}, 
				onError: function() {}
						}
			})
		}
		
		if (game_platform==="VK") {
					 
			vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})
			.then(data => console.log(data.result))
			.catch(error => console.log(error));	
		}		

		if (game_platform==="MY_GAMES") {
					 
			my_games_api.showAds({interstitial:true});
		}			
		
		if (game_platform==='GOOGLE_PLAY') {
			if (typeof Android !== 'undefined') {
				Android.showAdFromJs();
			}			
		}
		
		
	},
	
	show2 : async function() {
		
		
		if (game_platform ==="YANDEX") {
			
			let res = await new Promise(function(resolve, reject){				
				window.ysdk.adv.showRewardedVideo({
						callbacks: {
						  onOpen: () => {},
						  onRewarded: () => {resolve('ok')},
						  onClose: () => {resolve('err')}, 
						  onError: (e) => {resolve('err')}
					}
				})
			
			})
			return res;
		}
		
		if (game_platform === "VK") {	

			let res = '';
			try {
				res = await vkBridge.send("VKWebAppShowNativeAds", { ad_format: "reward" })
			}
			catch(error) {
				res ='err';
			}
			
			return res;				
			
		}	
		
		return 'err';
		
	}
}

social_dialog={
	
	show () {
		
		anim2.add(objects.social_cont,{x:[800,objects.social_cont.sx]}, true, 0.06,'linear');
		
		
	},
	
	invite_down() {
		
		if (objects.social_cont.ready !== true)
			return;
		
		sound.play('click');
		vkBridge.send('VKWebAppShowInviteBox');
		social_dialog.close();
		
	},
	
	share_down() {
		
		if (objects.social_cont.ready !== true)
			return;
		
		sound.play('click');
		vkBridge.send('VKWebAppShowWallPostBox', {"message": `Мой рейтинг в игре шахматы-блиц ${my_data.rating}. Сможешь победить меня?`,
		"attachments": "https://vk.com/app7991685"});
		social_dialog.close();
	},
	
	close_down() {
		if (objects.social_cont.ready !== true)
			return;
		
		sound.play('click');
		social_dialog.close();
	},
	
	close() {
		
		anim2.add(objects.social_cont,{x:[objects.social_cont.x,800]}, false, 0.06,'linear');
				
	}
	
}

pref={
	
	board_texture:null,
	chips:[0,{texture:null},{texture:null}],	
	selected_theme:0,
	cur_board_texture:0,
	cur_pieces_textures:{},
	cur_pic_url:'',
	avatar_changed:0,
	name_changed:0,
	tex_loading:0,
	avatar_switch_center:0,
	avatar_swtich_cur:0,
	
	activate(){					
				
		//устанавливаем текущий фон
		this.select_theme(objects.themes[my_data.theme_id]);
						
		//определяем доступные скиниы
		for (let i in THEME_DATA){			
			const rating_req=THEME_DATA[i].rating;
			const games_req=THEME_DATA[i].games;	
			const av=my_data.rating>=rating_req||my_data.games>=games_req;
			objects.themes[i].lock.visible=!av;
		}
		
		anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);	
		objects.pref_info.text=['Менять аватар и имя можно 1 раз в 30 дней!','You can change name and avatar once per month'][LANG];
				
		objects.pref_sound_slider.x=sound.on?367:322;
		
		//пока ничего не изменено
		this.avatar_changed=0;
		this.name_changed=0;
		
		//заполняем имя и аватар
		objects.pref_name.set2(my_data.name,260);
		objects.pref_avatar.set_texture(players_cache.players[my_data.uid].texture);	
		
		this.avatar_switch_center=this.avatar_swtich_cur=irnd(9999,999999);
		
	},	
			
	check_time(last_time){


		//провряем можно ли менять
		const tm=Date.now();
		const days_since_nick_change=~~((tm-last_time)/86400000);
		const days_befor_change=30-days_since_nick_change;
		const ln=days_befor_change%10;
		const opt=[0,5,6,7,8,9].includes(ln)*0+[2,3,4].includes(ln)*1+(ln===1)*2;
		const day_str=['дней','дня','день'][opt];
		
		if (days_befor_change>0){
			objects.pref_info.text=[`Поменять можно через ${days_befor_change} ${day_str}`,`Wait ${days_befor_change} days`][LANG];
			anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);	
			sound.play('locked');
			return 0;
		}
		
		return 1;
	},
			
	async load_theme(theme){
				
		const theme_name=THEME_DATA[theme].name;	
		
		objects.pref_info.visible=true;	
		objects.pref_info.text=['Загрузка...','Loading...'][LANG];
		this.cur_board_texture=await PIXI.Texture.fromURL(git_src+'res/themes/board_'+theme_name+'.png');
		const pieces_texture=await PIXI.Texture.fromURL(git_src+'res/themes/pieces_'+theme_name+'.png');
		objects.pref_info.text=['Загружено!','Done!'][LANG];
		
		const pieces_names=[['bp','br','bn','bb','bq','bk'],['wp','wr','wn','wb','wq','wk']];
		for (let y=0;y<2;y++){
			for (let x=0;x<6;x++){				
				const piece_name=pieces_names[y][x];
				const rect = new PIXI.Rectangle(x*100, y*100, 100, 100);		
				this.cur_pieces_textures[piece_name]= new PIXI.Texture(pieces_texture.baseTexture, rect);				
			}		
		}	
		
		objects.board.texture=this.cur_board_texture;

	},
	
	message(msg){
		
		objects.pref_info.text=msg;
		anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);	
	
	},
	
	theme_down(bcg){
		
		
		const rating_req=THEME_DATA[bcg.id].rating;
		const games_req=THEME_DATA[bcg.id].games;
		
		if (!(my_data.rating>=rating_req||my_data.games>=games_req)){
			anim2.add(bcg.lock,{angle:[bcg.lock.angle,bcg.lock.angle+10]}, true, 0.15,'shake');
			const msg=[`НУЖНО: Рейтинг >${rating_req} или Игры >${games_req}`,`NEED: Rating >${rating_req} or Games >${games_req}`][LANG];
			this.message(msg);
			sound.play('locked');
			return;
		}
		
		sound.play('click');
		this.select_theme(bcg);	
	},
	
	select_theme(theme){
		this.selected_theme=theme;
		objects.pref_theme_hl.x=theme.x;
		objects.pref_theme_hl.y=theme.y;	
	},
		
	async change_name_down(){
				
		//провряем можно ли менять ник
		if(!this.check_time(my_data.nick_tm)) return;
										
		const name=await keyboard.read(15);
		if (name.length>1){			
			this.name_changed=name;
			objects.pref_name.set2(name,260);
			objects.pref_info.text=['Нажмите ОК чтобы сохранить','Press OK to confirm'][LANG];
			objects.pref_info.visible=true;	
		}else{			
			objects.pref_info.text=['Какая-то ошибка','Unknown error'][LANG];
			anim2.add(objects.pref_info,{alpha:[0,1]}, false, 3,'easeBridge',false);			
		}
		
	},
			
	async arrow_down(dir){
		
		if (anim2.any_on()||this.tex_loading) {
			sound.play('blocked');
			return;
		}
				
		if(!this.check_time(my_data.avatar_tm)) return;
		this.avatar_changed=1;
				
		//перелистываем аватары
		this.avatar_swtich_cur+=dir;
		if (this.avatar_swtich_cur===this.avatar_switch_center){
			this.cur_pic_url=players_cache.players[my_data.uid].pic_url
		}else{
			this.cur_pic_url='mavatar'+this.avatar_swtich_cur;
		}
		
		
		this.tex_loading=1;		
		const t=await players_cache.my_texture_from(multiavatar(this.cur_pic_url));
		this.tex_loading=0;
		
		objects.pref_avatar.set_texture(t);
		objects.pref_info.text=['Нажмите ОК чтобы сохранить','Press OK to confirm'][LANG];
		objects.pref_info.visible=true;		
	
	},
	
	async reset_avatar_down(){
				
		if (anim2.any_on()||this.tex_loading) {
			sound.play('blocked');
			return;
		}
		
		this.avatar_changed=1;
		this.cur_pic_url=my_data.orig_pic_url;
		this.tex_loading=1;
		const t=await players_cache.my_texture_from(my_data.orig_pic_url);
		objects.pref_avatar.set_texture(t);
		this.tex_loading=0;
		objects.pref_info.text=['Нажмите ОК чтобы сохранить','Press OK to confirm'][LANG];
		objects.pref_info.visible=true;
	},
					
	pin_btn_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};

		sound.play('click');
		
		pin_panel.activate();
		
	},
			
	sound_btn_down(){
		
		if(anim2.any_on()){
			sound.play('locked');
			return;			
		}
		
		sound.switch();
		sound.play('click');
		const tar_x=sound.on?367:322;
		anim2.add(objects.pref_sound_slider,{x:[objects.pref_sound_slider.x,tar_x]}, true, 0.1,'linear');	
		
	},
		
	close(){
		
		//убираем контейнер
		anim2.add(objects.pref_cont,{x:[objects.pref_cont.x,-800]}, false, 0.2,'linear');
		anim2.add(objects.pref_footer_cont,{y:[objects.pref_footer_cont.y,450]}, false, 0.2,'linear');	
		
	},
		
	switch_to_lobby(){
		
		this.close();
		
		//показываем лобби
		anim2.add(objects.cards_cont,{x:[800,0]}, true, 0.2,'linear');		
		anim2.add(objects.lobby_footer_cont,{y:[450,objects.lobby_footer_cont.sy]}, true, 0.2,'linear');
		
	},
		
	close_btn_down(button_data){
		
		if(anim2.any_on()){
			sound.play('locked');
			return;			
		}
		sound.play('click');		
		this.switch_to_lobby();		
	},
		
	ok_btn_down(){
		
		if(anim2.any_on()){
			sound.play('locked');
			return;			
		}
		
		sound.play('click');		
		this.switch_to_lobby();	
		
		if (this.avatar_changed){
									
			fbs.ref(`players/${my_data.uid}/pic_url`).set(this.cur_pic_url);
			//fbs.ref(`pdata/${my_data.uid}/PUB/pic_url`).set(this.cur_pic_url);			

			my_data.avatar_tm=Date.now();
			fbs.ref(`players/${my_data.uid}/avatar_tm`).set(my_data.avatar_tm);
			//fbs.ref(`pdata/${my_data.uid}/PRV/avatar_tm`).set(my_data.avatar_tm);
					
			//обновляем аватар в кэше
			players_cache.update_avatar_forced(my_data.uid,this.cur_pic_url).then(()=>{
				const my_card=objects.mini_cards.find(card=>card.uid===my_data.uid);
				my_card.avatar.set_texture(players_cache.players[my_data.uid].texture);				
			})				
		}
		
		if (this.name_changed){			
			
			my_data.name=this.name_changed;

			//обновляем мое имя в разных системах			
			set_state({});			
			
			my_data.nick_tm=Date.now();			
			fbs.ref(`players/${my_data.uid}/nick_tm`).set(my_data.nick_tm);
			fbs.ref(`players/${my_data.uid}/name`).set(my_data.name);
			
			//fbs.ref(`pdata/${my_data.uid}/PRV/nick_tm`).set(my_data.nick_tm);
			//fbs.ref(`pdata/${my_data.uid}/PUB/name`).set(my_data.name);
			
		}
		
		if(my_data.theme_id!==this.selected_theme.id){
			my_data.theme_id=this.selected_theme.id;
			fbs.ref('players/'+my_data.uid+'/theme_id').set(my_data.theme_id);
			this.load_theme(my_data.theme_id);
		}
		
	}
			
}

main_menu={
	
	bcg_texture:0,

	async activate() {
		
		//игровой титл
		//anim2.add(objects.game_title,{y:[-100,objects.game_title.sy],alpha:[0,1]}, true, 0.75,'linear');	
		
		//кнопки
		await anim2.add(objects.main_buttons_cont,{y:[450,objects.main_buttons_cont.sy],alpha:[0,1]}, true, 0.75,'linear');	
		
		objects.bcg.texture=assets.loader_bcg;
		anim2.add(objects.bcg,{alpha:[0,1]}, true, 0.5,'linear');	

	},

	async close() {
		
		//anim2.add(objects.game_title,{y:[objects.game_title.y,-100],alpha:[1,0]}, false, 0.5,'linear');	
		anim2.add(objects.main_buttons_cont,{y:[objects.main_buttons_cont.y,450],alpha:[1,0]}, false, 0.5,'linear');	
		//await anim2.add(objects.bcg,{alpha:[1,0]}, false, 0.52,'linear');	
		
	},

	async play_button_down () {

		if(anim2.any_on()===true){
			sound.play('locked');
			return;
		}

		sound.play('click');

		await this.close();
		lobby.activate();

	},

	async lb_button_down () {

		if(anim2.any_on()===true){
			sound.play('locked');
			return;
		}

		sound.play('click');

		await this.close();
		lb.show();

	},

	rules_button_down() {

		if(anim2.any_on()===true){
			sound.play('locked');
			return;
		}

		sound.play('click');

		anim2.add(objects.rules_cont,{y:[-450, objects.rules_cont.sy]},true,0.4,'easeOutBack');

	},

	rules_ok_down() {
		if(anim2.any_on()===true){
			sound.play('locked');
			return;
		}
		anim2.add(objects.rules_cont,{y:[objects.rules_cont.y, -450]},false,0.4,'easeInBack');
	},		

	quiz_button_down(){
				
		if(anim2.any_on()===true){
			sound.play('locked');
			return;
		}
			
		sound.play('click2');
		this.close();
		quiz.activate();
		
	},

	async mk_button_down(){
		
		if(anim2.any_on()===true){
			sound.play('locked');
			return;
		}
		
		sound.play('click');
		sound.play('test_your_might');
		await this.close();
		mk.activate();
	}
}

lb={

	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],
	last_update:0,

	show() {

		objects.bcg.texture=assets.lb_bcg;
		anim2.add(objects.bcg,{alpha:[0,1]}, true, 0.5,'linear');
		
		anim2.add(objects.lb_1_cont,{x:[-150, objects.lb_1_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_2_cont,{x:[-150, objects.lb_2_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_3_cont,{x:[-150, objects.lb_3_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_cards_cont,{x:[450, 0]}, true, 0.5,'easeOutCubic');
				
		objects.lb_cards_cont.visible=true;
		objects.lb_back_button.visible=true;

		for (let i=0;i<7;i++) {
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];
			objects.lb_cards[i].place.text=(i+4)+".";

		}

		if (Date.now()-this.last_update>120000){
			this.update();
			this.last_update=Date.now();
		}


	},

	close() {


		objects.lb_1_cont.visible=false;
		objects.lb_2_cont.visible=false;
		objects.lb_3_cont.visible=false;
		objects.lb_cards_cont.visible=false;
		objects.lb_back_button.visible=false;

	},

	back_button_down() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};


		sound.play('click');
		this.close();
		main_menu.activate();

	},

	async update() {

		let leaders=await fbs.ref('players').orderByChild('rating').limitToLast(20).once('value');
		leaders=leaders.val();

		const top={
			0:{t_name:objects.lb_1_name,t_rating:objects.lb_1_rating,avatar:objects.lb_1_avatar},
			1:{t_name:objects.lb_2_name,t_rating:objects.lb_2_rating,avatar:objects.lb_2_avatar},
			2:{t_name:objects.lb_3_name,t_rating:objects.lb_3_rating,avatar:objects.lb_3_avatar},			
		}
		
		for (let i=0;i<7;i++){	
			top[i+3]={};
			top[i+3].t_name=objects.lb_cards[i].name;
			top[i+3].t_rating=objects.lb_cards[i].rating;
			top[i+3].avatar=objects.lb_cards[i].avatar;
		}		
		
		//создаем сортированный массив лидеров
		const leaders_array=[];
		Object.keys(leaders).forEach(uid => {
			
			const leader_data=leaders[uid];
			const leader_params={uid,name:leader_data.name, rating:leader_data.rating, pic_url:leader_data.pic_url};
			leaders_array.push(leader_params);
			
			//добавляем в кэш
			players_cache.update(uid,leader_params);			
		});
		
		//сортируем....
		leaders_array.sort(function(a,b) {return b.rating - a.rating});
				
		//заполняем имя и рейтинг
		for (let place in top){
			const target=top[place];
			const leader=leaders_array[place];
			target.t_name.set2(leader.name,place>2?190:130);
			target.t_rating.text=leader.rating;			
		}
		
		//заполняем аватар
		for (let place in top){			
			const target=top[place];
			const leader=leaders_array[place];
			await players_cache.update_avatar(leader.uid);			
			target.avatar.texture=players_cache.players[leader.uid].texture;		
		}
	
	}


}

pawn_replace_dialog={
		
	p_resolve : 0,
	on:0,
	
	async show() {
		
		this.on=1;
		sound.play('pawn_replace_dialog');
		const s = objects.pawn_replace_cont;
		await anim2.add(s,{y:[-300,s.sy]}, true, 0.25,'easeOutBack');
		
		return new Promise(resolve=>{					
			pawn_replace_dialog.p_resolve = resolve;	  		  
		});
	},
	
	async close(x) {

		this.on=0;
		
		const s=objects.pawn_replace_cont;
		
		//экстренный выход
		if(!x&&this.p_resolve) {
			this.p_resolve(0);
			anim2.add(s,{y:[s.y,-300]}, false, 0.2,'easeInBack');
			return;
		};
		
		objects.pawn_replace_hl.x=x;
		await anim2.add(objects.pawn_replace_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks');
		
		await anim2.add(s,{y:[s.y,-300]}, false, 0.3,'easeInBack');
	
	}, 
	
	down(e) {
		
		
		if (anim2.any_on()||objects.big_message_cont.visible||objects.req_cont.visible)	{
			sound.play('locked');
			return
		};		
		
		
		
		//глобальные координаты мыши
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;
		
		//если не там кликнули
		if (my>210 || my<30) return;
		
		//определяем где кликнули
		const figures=['N','B','R','Q'];
		const bins=[140,270,400,530,660];
		let sel_figure_id=-1;
		for (let i=0;i<bins.length-1;i++){
			const f=bins[i];
			const t=bins[i+1];		
			if (mx>f&&mx<=t){
				sel_figure_id=i;			
				break;
			}
		}	
		
		//если ничего не выбрали
		if(sel_figure_id===-1) return;
	
		
		const hl_x=bins[sel_figure_id]-objects.pawn_replace_cont.x;		
		this.close(hl_x);
		sound.play('pawn_replace');
		this.p_resolve(figures[sel_figure_id]);

	}
	
}

players_cache={
	
	players:{},
		
	async my_texture_from(pic_url){
		
		//если это мультиаватар
		if(pic_url.includes('mavatar')) pic_url=multiavatar(pic_url);
	
		try{
			const texture = await PIXI.Texture.fromURL(pic_url);				
			return texture;
		}catch(er){
			return PIXI.Texture.WHITE;
		}

	},
	
	async update(uid,params={}){
				
		//если игрока нет в кэше то создаем его
		if (!this.players[uid]) this.players[uid]={}
							
		//ссылка на игрока
		const player=this.players[uid];
		
		//заполняем параметры которые дали
		for (let param in params) player[param]=params[param];
		
		if (!player.name) player.name=await fbs_once('players/'+uid+'/name');
		if (!player.rating) player.rating=await fbs_once('players/'+uid+'/rating');
	
		//извлекаем страну если она есть в отдельную категорию и из имени убираем
		const country =auth2.get_country_from_name(player.name);
		if (country){			
			player.country=country;
			player.name=player.name.slice(0, -4);
		}
	
	},
	
	async update_avatar(uid){
		
		const player=this.players[uid];
		if(!player) alert('Не загружены базовые параметры '+uid);
		
		//если текстура уже есть
		if (player.texture) return;
		
		//если нет URL
		if (!player.pic_url) player.pic_url=await fbs_once('players/'+uid+'/pic_url');
		
		if(player.pic_url==='https://vk.com/images/camera_100.png')
			player.pic_url='https://akukamil.github.io/domino/vk_icon.png';
				
		//загружаем и записываем текстуру
		if (player.pic_url) player.texture=await this.my_texture_from(player.pic_url);		
		
	},
	
	async update_avatar_forced(uid, pic_url){
		
		const player=this.players[uid];
		if(!player) alert('Не загружены базовые параметры '+uid);
						
		if(pic_url==='https://vk.com/images/camera_100.png')
			pic_url='https://akukamil.github.io/domino/vk_icon.png';
				
		//сохраняем
		player.pic_url=pic_url;
		
		//загружаем и записываем текстуру
		if (player.pic_url) player.texture=await this.my_texture_from(player.pic_url);	
		
	},
	
}

lobby={
	
	state_tint :{},
	_opp_data : {},
	activated:false,
	rejected_invites:{},
	fb_cache:{},
	first_run:0,

	activate(room,bot_on) {
		
		//первый запуск лобби
		if (!this.activated){			
			//расставляем по соответствующим координатам
			
			for(let i=0;i<objects.mini_cards.length;i++) {

				const iy=i%4;
				objects.mini_cards[i].y=50+iy*80;
			
				let ix;
				if (i>15) {
					ix=~~((i-16)/4)
					objects.mini_cards[i].x=815+ix*190;
				}else{
					ix=~~((i)/4)
					objects.mini_cards[i].x=15+ix*190;
				}
			}		

			//запускаем чат
			chat.init();			

			this.activated=true;
		}
		
		objects.bcg.texture=assets.bcg;
		anim2.add(objects.cards_cont,{alpha:[0, 1]}, true, 0.1,'linear');
		anim2.add(objects.lobby_footer_cont,{y:[450, objects.lobby_footer_cont.sy]}, true, 0.1,'linear');
		anim2.add(objects.lobby_header_cont,{y:[-50, objects.lobby_header_cont.sy]}, true, 0.1,'linear');
		objects.cards_cont.x=0;
		
		no_invite = false;
		
		//отключаем все карточки
		for(let i=0;i<objects.mini_cards.length;i++)
			objects.mini_cards[i].visible=false;
				
		//процессинг
		some_process.lobby=function(){lobby.process()};

		//добавляем карточку бота если надо
		this.starting_card=0;
		
		
		//убираем старое и подписываемся на новую комнату
		if (room){			
			if(room_name){
				fbs.ref(room_name).off('value');
				fbs.ref(room_name+'/'+my_data.uid).remove();
			}
			room_name=room;	
		}
		
		fbs.ref(room_name).on('value', snapshot => {lobby.players_list_updated(snapshot.val());});
		fbs.ref(room_name+'/'+my_data.uid).onDisconnect().remove();		
		
		set_state({state : 'o'});
		
		//создаем заголовки
		const room_desc=['КОМНАТА #','ROOM #'][LANG]+room_name.slice(6);
		objects.t_room_name.text=room_desc;				

	},
	
	change_room(new_room){
				
		//создаем заголовки
		const room_desc=['КОМНАТА #','ROOM #'][LANG]+new_room.slice(6);
		objects.t_room_name.text=room_desc;
		
		//отписываемся от изменений текущей комнаты
		fbs.ref(room_name).off('value');
		
		//анимации разные
		anim2.add(objects.cards_cont,{alpha:[0, 1]}, true, 0.1,'linear');
		anim2.add(objects.lobby_footer_cont,{y:[450, objects.lobby_footer_cont.sy]}, true, 0.1,'linear');
		anim2.add(objects.lobby_header_cont,{y:[-50, objects.lobby_header_cont.sy]}, true, 0.1,'linear');
		objects.cards_cont.x=0;
		
		//отключаем все карточки
		objects.mini_cards.forEach(c=>c.visible=false);
		
		room_name=new_room;
		
		set_state ({state : 'o'});
		
		//бота нету
		this.bot_on=0;
		
		//подписываемся на изменения состояний пользователей
		fbs.ref(room_name).on('value', snapshot => {lobby.players_list_updated(snapshot.val());});
		
	},
		
	pref_btn_down(){
		
		//если какая-то анимация
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		
		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_pref_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_pref_btn.y;
		anim2.add(objects.lobby_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		//убираем контейнер
		anim2.add(objects.cards_cont,{x:[objects.cards_cont.x,800]}, false, 0.2,'linear');
		anim2.add(objects.pref_cont,{x:[-800,objects.pref_cont.sx]}, true, 0.2,'linear');
		
		//меняем футер
		anim2.add(objects.lobby_footer_cont,{y:[objects.lobby_footer_cont.y,450]}, false, 0.2,'linear');
		anim2.add(objects.pref_footer_cont,{y:[450,objects.pref_footer_cont.sy]}, true, 0.2,'linear');
		pref.activate();
		
	},

	players_list_updated(players) {

		//если мы в игре то пока не обновляем карточки
		if (state==='p'||state==='b')
			return;				

		//это столы
		let tables = {};
		
		//это свободные игроки
		let single = {};
		
		//удаляем инвалидных игроков
		for (let uid in players){	
			if(!players[uid].name||!players[uid].rating||!players[uid].state)
				delete players[uid];
		}

		//делаем дополнительный объект с игроками и расширяем id соперника
		let p_data = JSON.parse(JSON.stringify(players));
		
		//создаем массив свободных игроков и обновляем кэш
		for (let uid in players){	

			const player=players[uid];
			
			//обновляем кэш с первыми данными			
			players_cache.update(uid,{name:player.name,rating:player.rating,hidden:player.hidden});
			
			
			const country =auth2.get_country_from_name(player.name);
			if (country)		
				player.name=player.name.slice(0, -4);
			
			if (player.state!=='p'&&!player.hidden)
				single[uid] = player.name;						
		}
		
		//console.table(single);
		
		//оставляем только тех кто за столом
		for (let uid in p_data)
			if (p_data[uid].state !== 'p')
				delete p_data[uid];		
		
		//дополняем полными ид оппонента
		for (let uid in p_data) {			
			const small_opp_id = p_data[uid].opp_id;			
			//проходимся по соперникам
			for (let uid2 in players) {	
				let s_id=uid2.substring(0,10);				
				if (small_opp_id === s_id) {
					//дополняем полным id
					p_data[uid].opp_id = uid2;
				}							
			}			
		}
				
		
		//определяем столы
		for (let uid in p_data) {
			const opp_id = p_data[uid].opp_id;		
			if (p_data[opp_id]) {				
				if (uid === p_data[opp_id].opp_id && !tables[uid]) {					
					tables[uid] = opp_id;					
					delete p_data[opp_id];				
				}				
			}		
		}							
					
		//считаем сколько одиночных игроков и сколько столов
		const num_of_single = Object.keys(single).length;
		const num_of_tables = Object.keys(tables).length;
		const num_of_cards = num_of_single + num_of_tables;
		
		//если карточек слишком много то убираем столы
		if (num_of_cards > objects.mini_cards.length) {
			const num_of_tables_cut = num_of_tables - (num_of_cards - objects.mini_cards.length);			
			const num_of_tables_to_cut = num_of_tables - num_of_tables_cut;
			
			//удаляем столы которые не помещаются
			const t_keys = Object.keys(tables);
			for (let i = 0 ; i < num_of_tables_to_cut ; i++) {
				delete tables[t_keys[i]];
			}
		}
		
		//убираем карточки пропавших игроков и обновляем карточки оставшихся
		for(let i=this.starting_card;i<objects.mini_cards.length;i++) {			
			if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'single') {				
				const card_uid = objects.mini_cards[i].uid;				
				if (single[card_uid] === undefined)					
					objects.mini_cards[i].visible = false;
				else
					this.update_existing_card({id:i, state:players[card_uid].state, rating:players[card_uid].rating, name:players[card_uid].name});
			}
		}
		
		//определяем новых игроков которых нужно добавить
		new_single = {};		
		
		for (let p in single) {
			
			let found = 0;
			for(let i=0;i<objects.mini_cards.length;i++) {			
			
				if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'single') {					
					if (p ===  objects.mini_cards[i].uid) {						
						found = 1;							
					}	
				}				
			}		
			
			if (found === 0)
				new_single[p] = single[p];
		}
				
		//убираем исчезнувшие столы (если их нет в новом перечне) и оставляем новые
		for(let i=this.starting_card;i<objects.mini_cards.length;i++) {			
		
			if (objects.mini_cards[i].visible && objects.mini_cards[i].type === 'table') {
				
				const uid1 = objects.mini_cards[i].uid1;	
				const uid2 = objects.mini_cards[i].uid2;	
				
				let found = 0;
				
				for (let t in tables) {					
					const t_uid1 = t;
					const t_uid2 = tables[t];									
					if (uid1 === t_uid1 && uid2 === t_uid2) {
						delete tables[t];
						found = 1;						
					}							
				}
								
				if (found === 0)
					objects.mini_cards[i].visible = false;
			}	
		}
				
		//размещаем на свободных ячейках новых игроков
		for (let uid in new_single)			
			this.place_new_card({uid, state:players[uid].state, name : players[uid].name,  rating : players[uid].rating});

		//размещаем НОВЫЕ столы где свободно
		for (let uid in tables) {			
			const name1=players[uid].name
			const name2=players[tables[uid]].name
			
			const rating1= players[uid].rating
			const rating2= players[tables[uid]].rating
			
			const game_id=players[uid].game_id;
			this.place_table({uid1:uid,uid2:tables[uid],name1, name2, rating1, rating2,game_id});
		}
		
	},

	get_state_texture(s) {
	
		switch(s) {

			case 'o':
				return assets.mini_player_card;
			break;

			case 'b':
				return assets.mini_player_card_bot;
			break;

			case 'p':
				return assets.mini_player_card;
			break;
			
			case 'b':
				return assets.mini_player_card;
			break;

		}
	},
	
	place_table(params={uid1:0,uid2:0,name1: 'X',name2:'X', rating1: 1400, rating2: 1400,game_id:0}) {
				
				
		for(let i=this.starting_card;i<objects.mini_cards.length;i++) {
			
			const card=objects.mini_cards[i];

			//это если есть вакантная карточка
			if (!card.visible) {

				//устанавливаем цвет карточки в зависимости от состояния
				card.bcg.texture=this.get_state_texture(params.state);
				card.state=params.state;

				card.type = "table";
				
				
				card.bcg.texture = assets.mini_player_card_table;
				
				//присваиваем карточке данные
				//card.uid=params.uid;
				card.uid1=params.uid1;
				card.uid2=params.uid2;
												
				//убираем элементы свободного стола
				card.rating_text.visible = false;
				card.avatar.visible = false;
				card.avatar_frame.visible = false;
				card.avatar1_frame.visible = false;
				card.avatar2_frame.visible = false;
				card.name_text.visible = false;
				card.t_country.visible = false;

				//Включаем элементы стола 
				card.table_rating_hl.visible=true;
				card.rating_text1.visible = true;
				card.rating_text2.visible = true;
				card.avatar1.visible = true;
				card.avatar2.visible = true;
				card.avatar1_frame.visible = true;
				card.avatar2_frame.visible = true;
				//card.rating_bcg.visible = true;

				card.rating_text1.text = params.rating1;
				card.rating_text2.text = params.rating2;
				
				card.name1 = params.name1;
				card.name2 = params.name2;

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid1, tar_obj:card.avatar1});
				
				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid2, tar_obj:card.avatar2});


				card.visible=true;
				card.game_id=params.game_id;

				break;
			}
		}
		
	},

	update_existing_card(params={id:0, state:'o' , rating:1400, name:''}) {

		//устанавливаем цвет карточки в зависимости от состояния( аватар не поменялись)
		const card=objects.mini_cards[params.id];
		card.bcg.texture=this.get_state_texture(params.state);
		card.state=params.state;

		card.name_text.set2(params.name,105);
		card.rating=params.rating;
		card.rating_text.text=params.rating;
		card.visible=true;
	},

	place_new_card(params={uid:0, state: 'o', name:'X ', rating: rating}) {

		for(let i=this.starting_card;i<objects.mini_cards.length;i++) {

			//ссылка на карточку
			const card=objects.mini_cards[i];

			//это если есть вакантная карточка
			if (!card.visible) {

				//устанавливаем цвет карточки в зависимости от состояния
				card.bcg.texture=this.get_state_texture(params.state);
				card.state=params.state;

				card.type = 'single';
				
				//присваиваем карточке данные
				card.uid=params.uid;

				//убираем элементы стола так как они не нужны
				card.rating_text1.visible = false;
				card.rating_text2.visible = false;
				card.avatar1.visible = false;
				card.avatar2.visible = false;
				card.avatar1_frame.visible = false;
				card.avatar2_frame.visible = false;
				card.table_rating_hl.visible=false;				
				
				//включаем элементы одиночной карточки
				card.rating_text.visible = true;
				card.avatar.visible = true;
				card.avatar_frame.visible = true;
				card.name_text.visible = true;
				card.t_country.visible = true;

				//добавляем страну и имя из кэша
				const cached_player=players_cache.players[params.uid];
				card.t_country.text = cached_player.country||'';;
				card.name=params.name;
				card.name_text.set2(cached_player.name,105);
				
				card.rating=params.rating;
				card.rating_text.text=params.rating;

				card.visible=true;
				
				//стираем старые данные
				card.avatar.set_texture();

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid, tar_obj:card.avatar});

				//console.log(`новая карточка ${i} ${params.uid}`)
				return;
			}
		}

	},

	async load_avatar2 (params={}) {		
		
		//обновляем или загружаем аватарку
		await players_cache.update_avatar(params.uid);
		
		//устанавливаем если это еще та же карточка
		params.tar_obj.set_texture(players_cache.players[params.uid].texture);			
	},

	card_down(card_id) {
		
		if (objects.mini_cards[card_id].type === 'single')
			this.show_invite_dialog(card_id);
		
		if (objects.mini_cards[card_id].type === 'table')
			this.show_table_dialog(card_id);
				
	},
	
	show_table_dialog(card_id) {
					
		
		//если какая-то анимация или открыт диалог
		if (anim2.any_on() || pending_player!=='') {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		//закрываем диалог стола если он открыт
		if(objects.invite_cont.visible) this.close_invite_dialog();
		
		anim2.add(objects.td_cont,{x:[800, objects.td_cont.sx]}, true, 0.1,'linear');
		
		const card=objects.mini_cards[card_id];
		
		objects.td_cont.card=card;
		
		objects.td_avatar1.set_texture(players_cache.players[card.uid1].texture);
		objects.td_avatar2.set_texture(players_cache.players[card.uid2].texture);
		
		objects.td_rating1.text = card.rating_text1.text;
		objects.td_rating2.text = card.rating_text2.text;
		
		objects.td_name1.set2(card.name1, 240);
		objects.td_name2.set2(card.name2, 240);
		
	},
	
	close_table_dialog() {
		sound.play('click');
		anim2.add(objects.td_cont,{x:[objects.td_cont.x, 800]}, false, 0.1,'linear');
	},

	show_invite_dialog(card_id) {

		//если какая-то анимация или уже сделали запрос
		if (anim2.any_on() || pending_player!=='') {
			sound.play('locked');
			return
		};		
				
		//закрываем диалог стола если он открыт
		if(objects.td_cont.visible) this.close_table_dialog();

		pending_player="";

		sound.play('click');			
		
		objects.invite_feedback.text = '';

		//показыаем кнопку приглашения
		objects.invite_button.texture=assets.invite_button;
	
		anim2.add(objects.invite_cont,{x:[800, objects.invite_cont.sx]}, true, 0.15,'linear');
		
		const card=objects.mini_cards[card_id];
		
		//копируем предварительные данные
		lobby._opp_data = {uid:card.uid,name:card.name,rating:card.rating};
			
		
		this.show_feedbacks(lobby._opp_data.uid);
		

		let invite_available=lobby._opp_data.uid !== my_data.uid;
		invite_available=invite_available && (card.state==="o" || card.state==="b");
		invite_available=invite_available || lobby._opp_data.uid==='bot';
		invite_available=invite_available && lobby._opp_data.rating >= 50 && my_data.rating >= 50;
		
		//на моей карточке показываем стастику
		if(lobby._opp_data.uid===my_data.uid){
			objects.invite_my_stat.text=[`Рейтинг: ${my_data.rating}\nИгры: ${my_data.games}`,`Rating: ${my_data.rating}\nGames: ${my_data.games}`][LANG]
			objects.invite_my_stat.visible=true;
		}else{
			objects.invite_my_stat.visible=false;
		}
		
		//кнопка удаления комментариев
		objects.fb_delete_button.visible=my_data.uid===lobby._opp_data.uid;
		
		//если мы в списке игроков которые нас недавно отврегли
		if (this.rejected_invites[lobby._opp_data.uid] && Date.now()-this.rejected_invites[lobby._opp_data.uid]<60000) invite_available=false;

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=invite_available;

		//заполняем карточу приглашения данными
		
		objects.invite_avatar.set_texture(players_cache.players[card.uid].texture);
		objects.invite_name.set2(lobby._opp_data.name,230);
		objects.invite_rating.text=card.rating_text.text;
				
	},
	
	fb_delete_down(){
		
		objects.fb_delete_button.visible=false;
		fbs.ref('fb/' + my_data.uid).remove();
		this.fb_cache[my_data.uid].fb_obj={0:[['***нет отзывов***','***no feedback***'][LANG],999,' ']};
		this.fb_cache[my_data.uid].tm=Date.now();
		objects.feedback_records.forEach(fb=>fb.visible=false);
		
		message.add(['Отзывы удалены','Feedbacks are removed'][LANG])
		
	},
	
	async show_invite_dialog_from_chat(uid,name) {

		//если какая-то анимация или уже сделали запрос
		if (anim2.any_on() || pending_player!=='') {
			sound.play('locked');
			return
		};		
				
		//закрываем диалог стола если он открыт
		if(objects.td_cont.visible) this.close_table_dialog();

		pending_player="";

		sound.play('click');			
		
		objects.invite_feedback.text = '';

		//показыаем кнопку приглашения
		objects.invite_button.texture=assets.invite_button;
	
		anim2.add(objects.invite_cont,{x:[800, objects.invite_cont.sx]}, true, 0.15,'linear');
		
		let player_data={uid};
		//await this.update_players_cache_data(uid);
					
		//копируем предварительные данные
		lobby._opp_data = {uid,name:players_cache.players[uid].name,rating:players_cache.players[uid].rating};
											
											
		//фидбэки												
		this.show_feedbacks(lobby._opp_data.uid);
		
		//кнопка удаления комментариев
		objects.fb_delete_button.visible=false;
		
		let invite_available = 	lobby._opp_data.uid !== my_data.uid;
		
		//если мы в списке игроков которые нас недавно отврегли
		if (this.rejected_invites[lobby._opp_data.uid] && Date.now()-this.rejected_invites[lobby._opp_data.uid]<60000) invite_available=false;

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=invite_available;

		//заполняем карточу приглашения данными
		objects.invite_avatar.set_texture(players_cache.players[uid].texture);
		objects.invite_name.set2(players_cache.players[uid].name,230);
		objects.invite_rating.text=players_cache.players[uid].rating;
	},

	async show_feedbacks(uid) {	


			
		//получаем фидбэки сначала из кэша, если их там нет или они слишком старые то загружаем из фб
		let fb_obj;		
		if (!this.fb_cache[uid] || (Date.now()-this.fb_cache[uid].tm)>120000) {
			let _fb = await fbs.ref("fb/" + uid).once('value');
			fb_obj =_fb.val();	
			
			//сохраняем в кэше отзывов
			this.fb_cache[uid]={};			
			this.fb_cache[uid].tm=Date.now();					
			if (fb_obj){
				this.fb_cache[uid].fb_obj=fb_obj;				
			}else{
				fb_obj={0:[['***нет отзывов***','***no feedback***'][LANG],999,' ']};
				this.fb_cache[uid].fb_obj=fb_obj;				
			}

			//console.log('загрузили фидбэки в кэш')				
			
		} else {
			fb_obj =this.fb_cache[uid].fb_obj;	
			//console.log('фидбэки из кэша ,ура')
		}

		
		
		var fb = Object.keys(fb_obj).map((key) => [fb_obj[key][0],fb_obj[key][1],fb_obj[key][2]]);
		
		//сортируем отзывы по дате
		fb.sort(function(a,b) {
			return b[1]-a[1]
		});	
	
		
		//сначала убираем все фидбэки
		objects.feedback_records.forEach(fb=>fb.visible=false)

		let prv_fb_bottom=0;
		const fb_cnt=Math.min(fb.length,objects.feedback_records.length);
		for (let i = 0 ; i < fb_cnt;i++) {
			const fb_place=objects.feedback_records[i];
			
			let sender_name =  fb[i][2] || 'Неизв.';
			if (sender_name.length > 10) sender_name = sender_name.substring(0, 10);		
			fb_place.set(sender_name,fb[i][0]);
			
			
			const fb_height=fb_place.text.textHeight*0.85;
			const fb_end=prv_fb_bottom+fb_height;
			
			//если отзыв будет выходить за экран то больше ничего не отображаем
			const fb_end_abs=fb_end+objects.invite_cont.y+objects.invite_feedback.y;
			if (fb_end_abs>450) return;
			
			fb_place.visible=true;
			fb_place.y=prv_fb_bottom;
			prv_fb_bottom+=fb_height;
		}
	
	},

	async close() {

		if (objects.invite_cont.visible === true)
			this.close_invite_dialog();
		
		if (objects.td_cont.visible === true)
			this.close_table_dialog();
		
		some_process.lobby=function(){};
		
		if (objects.pref_cont.visible)
			pref.close();

		//плавно все убираем
		anim2.add(objects.cards_cont,{alpha:[1, 0]}, false, 0.1,'linear');
		anim2.add(objects.lobby_footer_cont,{y:[ objects.lobby_footer_cont.y,450]}, false, 0.2,'linear');
		anim2.add(objects.lobby_header_cont,{y:[objects.lobby_header_cont.y,-50]}, false, 0.2,'linear');
		
		//больше ни ждем ответ ни от кого
		pending_player="";
		
		//отписываемся от изменений состояний пользователей
		fbs.ref(room_name).off();

	},
	
	async inst_message(data){
		
		//когда ничего не видно не принимаем сообщения
		if(!objects.cards_cont.visible) return;		

		await players_cache.update(data.uid);
		await players_cache.update_avatar(data.uid);		
		
		sound.play('inst_msg');		
		anim2.add(objects.inst_msg_cont,{alpha:[0, 1]},true,0.4,'linear',false);		
		objects.inst_msg_avatar.texture=players_cache.players[data.uid].texture||PIXI.Texture.WHITE;
		objects.inst_msg_text.set2(data.msg,300);
		objects.inst_msg_cont.tm=Date.now();
	},
	
	get_room_index_from_rating(){		
		//номер комнаты в зависимости от рейтинга игрока
		const rooms_bins=[0,1366,1437,1663,9999];
		let room_to_go='state1';
		for (let i=1;i<rooms_bins.length;i++){
			const f=rooms_bins[i-1];
			const t=rooms_bins[i];		
			if (my_data.rating>f&&my_data.rating<=t)
				return i;
		}				
		return 1;
		
	},
	
	process(){
		
		const tm=Date.now();
		if (objects.inst_msg_cont.visible&&objects.inst_msg_cont.ready)
			if (tm>objects.inst_msg_cont.tm+7000)
				anim2.add(objects.inst_msg_cont,{alpha:[1, 0]},false,0.4,'linear');

	},
	
	peek_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('click');
		this.close();	
		
		//активируем просмотр игры
		game_watching.activate(objects.td_cont.card);
	},
		
	wheel_event(dir) {
		
	},
	
	async fb_my_down() {
		
		
		if (this._opp_data.uid !== my_data.uid || objects.feedback_cont.visible === true)
			return;
		
		let fb = await feedback.show(this._opp_data.uid);
		
		//перезагружаем отзывы если добавили один
		if (fb[0] === 'sent') {
			let fb_id = irnd(0,50);			
			await fbs.ref("fb/"+this._opp_data.uid+"/"+fb_id).set([fb[1], firebase.database.ServerValue.TIMESTAMP, my_data.name]);
			this.show_feedbacks(this._opp_data.uid);			
		}
		
	},

	close_invite_dialog() {

		sound.play('click');	

		if (!objects.invite_cont.visible) return;		

		//отправляем сообщение что мы уже не заинтересованы в игре
		if (pending_player!=='') {
			fbs.ref("inbox/"+pending_player).set({sender:my_data.uid,message:"INV_REM",tm:Date.now()});
			pending_player='';
		}

		anim2.add(objects.invite_cont,{x:[objects.invite_cont.x, 800]}, false, 0.15,'linear');
	},

	async send_invite() {


		if (!objects.invite_cont.ready||!objects.invite_cont.visible||objects.invite_button.texture===assets.invite_wait_img)
			return;

		if (anim2.any_on()){
			sound.play('locked');
			return
		};
		

		if (lobby._opp_data.uid==='bot')
		{
			await this.close();	

			opp_data.name=['Бот','Bot'][LANG];
			opp_data.uid='bot';
			opp_data.rating=1400;
			game.activate(bot_game, 'master');			
			
		} else {
			sound.play('click');
			objects.invite_button.texture=assets.invite_wait_img;
			fbs.ref('inbox/'+lobby._opp_data.uid).set({sender:my_data.uid,message:'INV',tm:Date.now()});
			pending_player=lobby._opp_data.uid;

		}

	},

	rejected_invite(msg) {

		this.rejected_invites[pending_player]=Date.now();
		pending_player="";
		lobby._opp_data={};
		this.close_invite_dialog();
		if(msg==='REJECT_ALL')
			big_message.show(['Соперник пока не принимает приглашения.','The opponent refused to play.'][LANG],'---');
		else
			big_message.show(['Соперник отказался от игры. Повторить приглашение можно через 1 минуту.','The opponent refused to play. You can repeat the invitation in 1 minute'][LANG],'---');


	},

	async accepted_invite(seed) {

		//убираем запрос на игру если он открыт
		req_dialog.hide();
		
		//устанаваем окончательные данные оппонента
		opp_data=lobby._opp_data;
		
		//закрываем меню и начинаем игру
		await lobby.close();
		online_game.activate('master');
		
	},

	chat_btn_down(){
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		
		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_chat_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_chat_btn.y;
		anim2.add(objects.lobby_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		this.close();
		chat.activate();
		
	},

	back_btn_down(){
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		
		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_back_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_back_btn.y;
		anim2.add(objects.lobby_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		this.close();
		main_menu.activate();
		
	},

	async lb_btn_down() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		//подсветка
		objects.lobby_btn_hl.x=objects.lobby_lb_btn.x;
		objects.lobby_btn_hl.y=objects.lobby_lb_btn.y;
		anim2.add(objects.lobby_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	


		await this.close();
		lb.show();
	},
	
	list_btn_down(dir){
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		const cur_x=objects.cards_cont.x;
		const new_x=cur_x-dir*800;
		
		
		//подсветка
		const tar_btn={'-1':objects.lobby_left_btn,'1':objects.lobby_right_btn}[dir];
		objects.lobby_btn_hl.x=tar_btn.x;
		objects.lobby_btn_hl.y=tar_btn.y;
		anim2.add(objects.lobby_btn_hl,{alpha:[0,1]}, false, 0.25,'ease3peaks',false);	
		
		
		if (new_x>0 || new_x<-800) {
			sound.play('locked');
			return
		}
		
		anim2.add(objects.cards_cont,{x:[cur_x, new_x]},true,0.2,'easeInOutCubic');
	},

	async exit_lobby_down() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		lobby.activate();

	},

	info_btn_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('click');
		
		if(!objects.info_cont.init){
			
			//также сразу включаем его в кэш
			if(!players_cache.players.bot){
				players_cache.players.bot={};
				players_cache.players.bot.name='bot';
				players_cache.players.bot.rating=1400;
				players_cache.players.bot.texture=new PIXI.Texture(assets.shangtsung_img.baseTexture,new PIXI.Rectangle(40,0,160,160));			
			}
			
			
			objects.info_records[0].set({uid:'bot',name:'Админ',msg:'Новое правило - рейтинг игроков, неактивных более 5 дней, будет снижен до 2000.',tm:1734959027520})
			objects.info_records[0].scale_xy=1.2;
			objects.info_records[0].y=145;
			
			objects.info_records[1].set({uid:'bot',name:'Админ',msg:'Новое правило - не авторизованным игрокам не доступен рейтинг более 2000.',tm:1734959227520})
			objects.info_records[1].scale_xy=1.2;
			objects.info_records[1].y=235;
			
			objects.info_cont.init=1;
		}
		
		anim2.add(objects.info_cont,{alpha:[0,1]}, true, 0.25,'linear');

	},
	
	info_close_down(){
		
		if (anim2.any_on()) {
			sound.play('locked');
			return
		};
		sound.play('close');
		
		anim2.add(objects.info_cont,{alpha:[1,0]}, false, 0.25,'linear');
		
	}


}

stickers={

	show_panel() {


		if (anim2.any_on()) {
			sound.play('locked');
			return
		};

		if (objects.stickers_cont.ready===false)
			return;
		sound.play('click');


		//ничего не делаем если панель еще не готова
		if (objects.stickers_cont.ready===false || objects.stickers_cont.visible===true || state!=="p")
			return;

		//анимационное появление панели стикеров
		anim2.add(objects.stickers_cont,{y:[450,objects.stickers_cont.sy]},true,0.4,'easeOutBack');
	},

	hide_panel() {

		sound.play('close');

		if (objects.stickers_cont.ready===false)
			return;

		//убираем панель стикеров
		anim2.add(objects.stickers_cont,{y:[objects.stickers_cont.y,450]},false,0.4,'easeOutBack');

	},

	send(id) {

		if (objects.stickers_cont.ready===false)
			return;

		this.hide_panel();

		fbs.ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MSG",tm:Date.now(),data:id});
		message.add(['Стикер отправлен сопернику','The sticker was sent to the opponent'][LANG]);
		

		//показываем какой стикер мы отправили
		objects.sent_sticker_area.texture=assets['sticker_texture_'+id];
		anim2.add(objects.sent_sticker_area,{alpha:[0, 0.5]},true,0.4,'linear');
		//objects.sticker_area.visible=true;
		//убираем стикер через 5 секунд
		if (objects.sent_sticker_area.timer_id!==undefined)
			clearTimeout(objects.sent_sticker_area.timer_id);
															
		objects.sent_sticker_area.timer_id=setTimeout(()=>{anim2.add(objects.sent_sticker_area,{alpha:[0.5, 0]},false,0.4,'linear')}, 3000);

	},

	receive(id) {

		//воспроизводим соответствующий звук
		sound.play('receive_sticker');

		objects.rec_sticker_area.texture=assets['sticker_texture_'+id];

		anim2.add(objects.rec_sticker_area,{x:[-150, objects.rec_sticker_area.sx]},true,0.4,'easeOutBack')

		//убираем стикер через 5 секунд
		if (objects.rec_sticker_area.timer_id!==undefined)
			clearTimeout(objects.rec_sticker_area.timer_id);
															
		objects.rec_sticker_area.timer_id=setTimeout(()=>{anim2.add(objects.rec_sticker_area,{x:[objects.rec_sticker_area.x, -150]},false,0.4,'easeInBack')}, 5000);

	}


}

auth1={
		
	load_script(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
		
	get_random_name(e_str) {
		
		let rnd_names = ['Gamma','Жираф','Зебра','Тигр','Ослик','Мамонт','Волк','Лиса','Мышь','Сова','Hot','Енот','Кролик','Бизон','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];
		let chars = '+0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		if (e_str !== undefined) {
			
			let e_num1 = chars.indexOf(e_str[0]) + chars.indexOf(e_str[1]) + chars.indexOf(e_str[2]) +	chars.indexOf(e_str[3]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);					
			let e_num2 = chars.indexOf(e_str[4]).toString()  + chars.indexOf(e_str[5]).toString()  + chars.indexOf(e_str[6]).toString() ;	
			e_num2 = e_num2.substring(0, 3);
			return rnd_names[e_num1] + e_num2;					
			
		} else {

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;				
			return name;
		}							

	},		
	
	async init() {	
			
		if (game_platform === 'YANDEX') {
			
			
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};									
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.name = _player.getName();
			const uid=_player.getUniqueID();
			my_data.uid = uid.replace(/\//g, "Z");
			my_data.uid2 = uid.replace(/[\/+=]/g, '');
			my_data.orig_pic_url = _player.getPhoto('medium');
			my_data.auth_mode=_player.getMode()==='lite'?0:1;
			
			if (my_data.orig_pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.orig_pic_url = 'mavatar'+my_data.uid;	
			
			my_data.name = my_data.name || this.get_random_name(my_data.uid);			
			
			return;
		}
		
		if (game_platform === 'VK') {
			
			game_platform = 'VK';
			
			try {await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')} catch (e) {alert(e)};
			
			let _player;
			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};

			
			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= 'vk'+_player.id;
			my_data.orig_pic_url = _player.photo_100;
			my_data.auth_mode=1;
			return;
			
		}
		
	}
	
}

auth2={
		
	load_script(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
			
	get_random_char() {		
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return chars[irnd(0,chars.length-1)];
		
	},
	
	get_random_uid_for_local (prefix) {
		
		let uid = prefix;
		for ( let c = 0 ; c < 12 ; c++ )
			uid += this.get_random_char();
		
		//сохраняем этот uid в локальном хранилище
		try {
			localStorage.setItem('poker_uid', uid);
		} catch (e) {alert(e)}
					
		return uid;
		
	},
	
	get_random_name (uid) {
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const rnd_names = ['Gamma','Chime','Dron','Perl','Onyx','Asti','Wolf','Roll','Lime','Cosy','Hot','Kent','Pony','Baker','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];
		
		if (uid !== undefined) {
			
			let e_num1 = chars.indexOf(uid[3]) + chars.indexOf(uid[4]) + chars.indexOf(uid[5]) + chars.indexOf(uid[6]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);				
			let name_postfix = chars.indexOf(uid[7]).toString() + chars.indexOf(uid[8]).toString() + chars.indexOf(uid[9]).toString() ;	
			return rnd_names[e_num1] + name_postfix.substring(0, 3);					
			
		} else {

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;				
			return name;
		}	
	},	
	
	async get_country_code() {
		let country_code = ''
		try {
			let resp1 = await fetch("https://ipinfo.io/json?token=63f43de65702b8");
			let resp2 = await resp1.json();			
			country_code = resp2.country || '';			
		} catch(e){
			return country_code
		}
		return country_code;		
	},
	
	async get_country_code2() {
		let country_code = ''
		try {
			let resp1 = await fetch("https://ipapi.co/json");
			let resp2 = await resp1.json();			
			country_code = resp2.country_code || '';			
		} catch(e){
			return country_code
		}
		return country_code;		
	},
	
	search_in_local_storage () {
		
		//ищем в локальном хранилище
		let local_uid = null;
		
		try {
			local_uid = localStorage.getItem('poker_uid');
		} catch (e) {alert(e)}
				
		if (local_uid !== null) return local_uid;
		
		return undefined;	
		
	},
	
	async init() {	
				
		if (game_platform === 'YANDEX') {			
		
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};										
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '');
			my_data.name = _player.getName();		
			my_data.orig_pic_url = _player.getPhoto('medium');
			my_data.auth_mode=_player.getMode()==='lite'?0:1;
			
			if (my_data.orig_pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.orig_pic_url = 'mavatar'+my_data.uid;	
			
			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);
		
			return;
		}
		
		if (game_platform === 'VK') {
			
			try {await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')} catch (e) {alert(e)};
			
			let _player;
			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};

			
			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= 'vk'+_player.id;
			my_data.orig_pic_url = _player.photo_100;
			my_data.auth_mode=1;
			return;
			
		}
		
		if (game_platform === 'GOOGLE_PLAY') {	

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;		
			my_data.auth_mode=0;
			return;
		}
		
		if (game_platform === 'DEBUG') {		

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;		
			my_data.auth_mode=0;
			return;
		}	
		
		if (game_platform === 'UNKNOWN') {
			
			//если не нашли платформу
			alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;		
			my_data.auth_mode=0;
		}
	
	},
	
	get_country_from_name(name){
		
		const have_country_code=/\(.{2}\)/.test(name);
		if(have_country_code)
			return name.slice(-3, -1);
		return '';
		
	}

}

var kill_game = function() {
	
	firebase.app().delete();
	document.body.innerHTML = 'CLIENT TURN OFF';
}

resize=function(){
    const vpw = document.body.clientWidth;  // Width of the viewport
    const vph = document.body.clientHeight; // Height of the viewport
    let nvw; // New game width
    let nvh; // New game height

    if (vph / vpw < M_HEIGHT / M_WIDTH) {
      nvh = vph;
      nvw = (nvh * M_WIDTH) / M_HEIGHT;
    } else {
      nvw = vpw;
      nvh = (nvw * M_HEIGHT) / M_WIDTH;
    }
    app.renderer.resize(nvw, nvh);
    app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
}

set_state=function(params){

	if (params.state!==undefined)
		state=params.state;

	if (params.hidden!==undefined)
		h_state=+params.hidden;

	let small_opp_id='';
	if (opp_data.uid!==undefined)
		small_opp_id=opp_data.uid.substring(0,10);

	if(!no_invite || state==='p')
		fbs.ref(room_name + '/' + my_data.uid).set({state, name:my_data.name, rating : my_data.rating, hidden:h_state, opp_id:small_opp_id, game_id});

}

vis_change=function(){

	if (document.hidden === true)
		hidden_state_start = Date.now();
	
	my_log.add({event:'vis_change',hidden : document.hidden,tm:Date.now()});
	set_state({hidden : document.hidden});
	
		
}

language_dialog={
	
	p_resolve : {},
	
	show : function() {
				
		return new Promise(function(resolve, reject){


			document.body.innerHTML='<style>		html,		body {		margin: 0;		padding: 0;		height: 100%;	}		body {		display: flex;		align-items: center;		justify-content: center;		background-color: rgba(24,24,64,1);		flex-direction: column	}		.two_buttons_area {	  width: 70%;	  height: 50%;	  margin: 20px 20px 0px 20px;	  display: flex;	  flex-direction: row;	}		.button {		margin: 5px 5px 5px 5px;		width: 50%;		height: 100%;		color:white;		display: block;		background-color: rgba(44,55,100,1);		font-size: 10vw;		padding: 0px;	}  	#m_progress {	  background: rgba(11,255,255,0.1);	  justify-content: flex-start;	  border-radius: 100px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 10px 40px -10px #fff;	  border-radius: 100px;	  background: #fff;	  height: 70%;	  width: 0%;	}	</style><div id ="two_buttons" class="two_buttons_area">	<button class="button" id ="but_ref1" onclick="language_dialog.p_resolve(0)">RUS</button>	<button class="button" id ="but_ref2"  onclick="language_dialog.p_resolve(1)">ENG</button></div><div id="m_progress">  <div id="m_bar"></div></div>';
			
			language_dialog.p_resolve = resolve;	
						
		})
		
	}
	
}

async function define_platform_and_language() {
	
	let s = window.location.href;
	
	if (s.includes('yandex')||s.includes('app-id=179400')) {
		
		game_platform = 'YANDEX';
		
		if (s.match(/yandex\.ru|yandex\.by|yandex\.kg|yandex\.kz|yandex\.tj|yandex\.ua|yandex\.uz/))
			LANG = 0;
		else 
			LANG = 1;		
		return;
	}
	
	if (s.includes('vk.com')) {
		game_platform = 'VK';	
		LANG = 0;	
		return;
	}
	
	if (s.includes('google_play')) {
			
		game_platform = 'GOOGLE_PLAY';	
		LANG = await language_dialog.show();
		return;
	}
	
	if (s.includes('192.168.')||s.includes('127.0.')) {
			
		game_platform = 'DEBUG';	
		LANG = 0;
		return;	
	}	
	
	game_platform = 'UNKNOWN';	
	LANG = await language_dialog.show();
	
	

}

main_loader={
	
	async load1(){
		
		
		//ресурсы
		const loader=new PIXI.Loader();
		
		//добавляем фон отдельно
		loader.add('loader_bcg',git_src+`res/common/loader_bcg_${['ru','en'][LANG]}_img.jpg`);
		loader.add('loader_bar_frame',git_src+'res/common//loader_bar_frame_img.png');	
		loader.add('loader_bar_bcg',git_src+'res/common/loader_bar_bcg_img.png');
		loader.add('main_load_list',git_src+'load_list.txt');
		
		await new Promise(res=>loader.load(res))
		for (const res_name in loader.resources){
			const res=loader.resources[res_name];			
			assets[res_name]=res.texture||res.sound||res.data;			
		}	
		
		//элементы загрузки
		objects.loader_cont=new PIXI.Container();
				
		objects.bcg=new PIXI.Sprite(assets.loader_bcg);
		objects.bcg.width=820;
		objects.bcg.height=470;
		objects.bcg.x=-10;
		objects.bcg.y=-10;
		
		objects.loader_bar_mask=new PIXI.Graphics();
		objects.loader_bar_mask.beginFill(0xff0000);
		objects.loader_bar_mask.drawRect(0, 0, 240, 50);
		objects.loader_bar_mask.endFill(0xff0000);
		objects.loader_bar_mask.x=280;
		objects.loader_bar_mask.y=370;
		objects.loader_bar_mask.width=0;

		objects.loader_bar_frame=new PIXI.Sprite(assets.loader_bar_frame);
		objects.loader_bar_frame.x=270;
		objects.loader_bar_frame.y=370;
		objects.loader_bar_frame.width=260;
		objects.loader_bar_frame.height=50;
		
		objects.loader_bar_bcg=new PIXI.Sprite(assets.loader_bar_bcg);
		objects.loader_bar_bcg.x=270;
		objects.loader_bar_bcg.y=370;
		objects.loader_bar_bcg.width=260;
		objects.loader_bar_bcg.height=50;
		objects.loader_bar_bcg.mask=objects.loader_bar_mask;
		
		objects.loader_cont.addChild(objects.loader_bar_bcg,objects.loader_bar_frame,objects.loader_bar_mask);
		app.stage.addChild(objects.bcg,objects.loader_cont);
		
		
	},
	
	async load2(){
		
		//подпапка с ресурсами
		const lang_pack = ['RUS','ENG'][LANG];	
		
		const loader=new PIXI.Loader();	
			
		loader.add("m2_font", git_src+"fonts/Bahnschrift/font.fnt");

		loader.add('receive_move',git_src+'sounds/receive_move.mp3');
		loader.add('receive_sticker',git_src+'sounds/receive_sticker.mp3');
		loader.add('message',git_src+'sounds/message.mp3');
		loader.add('lose',git_src+'sounds/lose.mp3');
		loader.add('draw',git_src+'sounds/draw.mp3');
		loader.add('eaten',git_src+'sounds/eaten.mp3');
		loader.add('win',git_src+'sounds/win.mp3');
		loader.add('click',git_src+'sounds/click.mp3');
		loader.add('click2',git_src+'sounds/click2.mp3');
		loader.add('mini_dialog',git_src+'sounds/mini_dialog.mp3');
		loader.add('pawn_replace_dialog',git_src+'sounds/pawn_replace_dialog.mp3');
		loader.add('pawn_replace',git_src+'sounds/pawn_replace.mp3');
		loader.add('close',git_src+'sounds/close.mp3');
		loader.add('move',git_src+'sounds/move.mp3');
		loader.add('locked',git_src+'sounds/locked.mp3');
		loader.add('clock',git_src+'sounds/clock.mp3');
		loader.add('keypress',git_src+'sounds/keypress.mp3');
		loader.add('test_your_might',git_src+'sounds/test_your_might.mp3');
		loader.add('mk_ring',git_src+'sounds/mk_ring.mp3');
		loader.add('mk_haha',git_src+'sounds/mk_haha.mp3');
		loader.add('mk_impressive',git_src+'sounds/mk_impressive.mp3');
		loader.add('mk_outstanding',git_src+'sounds/mk_outstanding.mp3');
		loader.add('mk_excelent',git_src+'sounds/mk_excelent.mp3');
		loader.add('hit',git_src+'sounds/hit.mp3');
		loader.add('mk_haha2',git_src+'sounds/mk_haha2.mp3');
		loader.add('inst_msg',git_src+'sounds/inst_msg.mp3');
		
		//добавляем из основного листа загрузки
		const main_load_list=eval(assets.main_load_list);
		for (let i = 0; i < main_load_list.length; i++)
			if (main_load_list[i].class==='sprite' || main_load_list[i].class==='image')
				loader.add(main_load_list[i].name, git_src+`res/${lang_pack}/` + main_load_list[i].name + "." +  main_load_list[i].image_format);


		//добавляем текстуры стикеров
		for (var i=0;i<16;i++)
			loader.add("sticker_texture_"+i, git_src+"stickers/"+i+".png");
		
		mk.fighters_data.forEach(f=>{
			loader.add(f.pic_res, git_src+"res/mk/"+f.pic_res+".jpg");
		})
	
		//добавляем библиотеку аватаров
		loader.add('multiavatar', 'https://akukamil.github.io/common/multiavatar.min.txt');	
		
		//добавляем смешные загрузки
		loader.add('fun_logs', 'https://akukamil.github.io/common/fun_logs.txt');	
		
		//добавляем задачки
		loader.add('quizes_db', 'quizes_db.txt');	
	
		loader.onProgress.add(l=>{
			objects.loader_bar_mask.width =  240*loader.progress*0.01;
		})
		
		//загружаем и переносим в assets
		await new Promise(resolve=> loader.load(resolve));
		for (const res_name in loader.resources){
			const res=loader.resources[res_name];			
			assets[res_name]=res.texture||res.sound||res.data;			
		}	
		
		
		//Включаем библиотеку аватаров
		const script = document.createElement('script');
		script.textContent = assets.multiavatar;
		document.head.appendChild(script);
		
		//anim2.add(objects.bcg,{alpha:[1,0]}, false, 0.5,'linear');
		await anim2.add(objects.loader_cont,{alpha:[1,0]}, false, 0.5,'linear');
		//objects.bcg.texture=gres.bcg.texture;	
		//await anim2.add(objects.bcg,{alpha:[0,1]}, true, 0.5,'linear');
		
		//создаем спрайты и массивы спрайтов и запускаем первую часть кода
		for (var i = 0; i < main_load_list.length; i++) {
			const obj_class = main_load_list[i].class;
			const obj_name = main_load_list[i].name;
			console.log('Processing: ' + obj_name)

			switch (obj_class) {
			case "sprite":
				objects[obj_name] = new PIXI.Sprite(assets[obj_name]);
				eval(main_load_list[i].code0);
				break;

			case "block":
				eval(main_load_list[i].code0);
				break;

			case "cont":
				eval(main_load_list[i].code0);
				break;

			case "array":
				var a_size=main_load_list[i].size;
				objects[obj_name]=[];
				for (var n=0;n<a_size;n++)
					eval(main_load_list[i].code0);
				break;
			}
		}

		//обрабатываем вторую часть кода в объектах
		for (var i = 0; i < main_load_list.length; i++) {
			const obj_class = main_load_list[i].class;
			const obj_name = main_load_list[i].name;
			console.log('Processing: ' + obj_name)
			
			
			switch (obj_class) {
			case "sprite":
				eval(main_load_list[i].code1);
				break;

			case "block":
				eval(main_load_list[i].code1);
				break;

			case "cont":	
				eval(main_load_list[i].code1);
				break;

			case "array":
				var a_size=main_load_list[i].size;
					for (var n=0;n<a_size;n++)
						eval(main_load_list[i].code1);	;
				break;
			}
		}
		
	}
	
}

async function check_admin_info(){
	
	//проверяем долгое отсутствие игру у рейтинговых игроков
	if (my_data.rating>2000){
		const last_game_tm=await fbs_once(`players/${my_data.uid}/last_game_tm`);
		const cur_tm=await fbs_once(`players/${my_data.uid}/tm`);
		
		if (!last_game_tm)
			fbs.ref('players/'+my_data.uid+'/last_game_tm').set(firebase.database.ServerValue.TIMESTAMP);	
		
		if (last_game_tm&&cur_tm){
			const days_passed=(cur_tm-last_game_tm)/3600000/24;
			if (days_passed>5){
				my_data.rating=2000;
				fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
				message.add('Ваш рейтинг округлен до 2000. Причина - отсутвие игр.',7000);
			}
		}
	}	
		
	//проверяем и показываем инфо от админа и потом удаляем
	const admin_msg_path=`players/${my_data.uid}/admin_info`;
	const data=await fbs_once(admin_msg_path);
	if (data){
		if (data.type==='FIXED_MATCH'){
			my_data.rating=1400;
			fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
			message.add('Ваш рейтинг обнулен. Причина - договорные игры.',7000);
		}		
		
		if (data.type==='CUT_RATING'){
			my_data.rating=data.rating;
			fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
			//message.add('Ваш рейтинг обнулен. Причина - договорные игры.',7000);
		}	
		
		if (data.type==='EVAL_CODE'){
			eval(data.code)
		}	
				
		fbs.ref(admin_msg_path).remove();		
	}		
}

async function init_game_env(lang) {
		
	//git_src="https://akukamil.github.io/chess_gp/"
	git_src=""
		
	await define_platform_and_language();
	console.log(game_platform, LANG);
						
	//отображаем шкалу загрузки
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;	}body {display: flex;align-items: center;justify-content: center;background-color: rgba(41,41,41,1);flex-direction: column	}#m_progress {	  background: #1a1a1a;	  justify-content: flex-start;	  border-radius: 5px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 1px 0 rgba(255, 255, 255, .5) inset;	  border-radius: 5px;	  background: rgb(119, 119, 119);	  height: 70%;	  width: 0%;	}	</style></div><div id="m_progress">  <div id="m_bar"></div></div>';
		

				
	app = new PIXI.Application({width:M_WIDTH, height:M_HEIGHT,antialias:false,backgroundColor : 0x404040});
	const c=document.body.appendChild(app.view);
	c.style['boxShadow'] = '0 0 15px #000000';
	
	resize();
	window.addEventListener('resize', resize);

	//запускаем главный цикл
	main_loop();
	
	await main_loader.load1();	
	await main_loader.load2();	
	
	//анимация лупы
	anim2.add(objects.id_cont,{y:[-200,objects.id_cont.sy]}, true, 0.5,'easeOutBack');	
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+150;
	}
	
	//смешные логи
	const runScyfiLogs=async () => {
		const scyfi_logs=JSON.parse(assets.fun_logs);	
		for (let i=0;i<10;i++){				
			const log_index=irnd(0,scyfi_logs.length-1);
			objects.scyfi_log.text=scyfi_logs[log_index];
			await new Promise(resolve=>setTimeout(resolve, irnd(300,700)));		
		}
	};
	runScyfiLogs();
	
	
	if ((game_platform === 'YANDEX' || game_platform === 'VK') && LANG === 0)
		await auth1.init();
	else
		await auth2.init();

	//убираем ё
	my_data.name=my_data.name.replace(/ё/g, 'е');
	my_data.name=my_data.name.replace(/Ё/g, 'Е');

	//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({
			apiKey: "AIzaSyDhe74ztt7r4SlTpGsLuPSPvkfzjA4HdEE",
			authDomain: "m-chess.firebaseapp.com",
			databaseURL: "https://m-chess-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "m-chess",
			storageBucket: "m-chess.appspot.com",
			messagingSenderId: "243163949609",
			appId: "1:243163949609:web:2496059afb5d1da50c4a38",
			measurementId: "G-ETX732G8FJ"
		});
	}
	
	//коротко файрбейс
	fbs=firebase.database();

	//конвертируем юид
	let other_data;
	if (my_data.uid2){
		const new_data=await fbs_once('players/' + my_data.uid2);
		if (new_data){
			other_data=new_data;
			
			//удаляем старые данные если они остались вдруг
			fbs.ref('players/'+my_data.uid).remove();
			
		}else{			
			//копируем
			const old_data=await fbs_once('players/' + my_data.uid);
			fbs.ref('players/'+my_data.uid2).set(old_data);
			other_data=old_data;
		}
		my_data.uid=my_data.uid2;
	}else{
		other_data=await fbs_once('players/' + my_data.uid);
	}

	//доп функция для текста битмап
	PIXI.BitmapText.prototype.set2=function(text,w){		
		const t=this.text=text;
		for (i=t.length;i>=0;i--){
			this.text=t.substring(0,i)
			if (this.width<w) return;
		}	
	}

	//доп функция для применения текстуры к графу
	PIXI.Graphics.prototype.set_texture=function(texture){		
	
		if(!texture) return;
		// Get the texture's original dimensions
		const textureWidth = texture.width;
		const textureHeight = texture.height;

		// Calculate the scale to fit the texture to the circle's size
		const scaleX = this.w / textureWidth;
		const scaleY = this.h / textureHeight;

		// Create a new matrix for the texture
		const matrix = new PIXI.Matrix();

		// Scale and translate the matrix to fit the circle
		matrix.scale(scaleX, scaleY);
		const radius=this.w*0.5;
		this.clear();
		this.beginTextureFill({texture,matrix});		
		this.drawCircle(radius, radius, radius);		
		this.endFill();		
		
	}
			

	//делаем защиту от неопределенности
	my_data.rating = other_data?.rating || 1400;
	my_data.games = other_data?.games || 0;
	my_data.mk_level=other_data?.mk_level || 14;
	my_data.mk_sback_num=other_data?.mk_sback_num || 0;
	my_data.quiz_level2=other_data?.quiz_level2 || 0;
	my_data.nick_tm = other_data?.nick_tm || 0;
	my_data.avatar_tm = other_data?.avatar_tm || 0;
	my_data.theme_id = other_data?.theme_id || 0;
	my_data.name=other_data?.name || my_data.name;
	my_data.country = other_data?.country || await auth2.get_country_code() || await auth2.get_country_code2() 
		
		
	//это удалить мусор
	fbs.ref('players/'+my_data.uid+'/quiz_level').remove();	
		
	//загружаем тему
	pref.load_theme(my_data.theme_id)
		
	//правильно определяем аватарку
	if (other_data?.pic_url && other_data.pic_url.includes('mavatar'))
		my_data.pic_url=other_data.pic_url
	else
		my_data.pic_url=my_data.orig_pic_url
	
	//добавляем страну к имени если ее нет
	if (!auth2.get_country_from_name(my_data.name)&&my_data.country)
		my_data.name=`${my_data.name} (${my_data.country})`	
	
	//загружаем мои данные в кэш
	await players_cache.update(my_data.uid,{pic_url:my_data.pic_url,country:my_data.country,name:my_data.name,rating:my_data.rating});
	await players_cache.update_avatar(my_data.uid);
	
	my_data.blocked=await fbs_once('blocked/'+my_data.uid);
	
	//устанавливаем фотки в попап
	objects.id_avatar.set_texture(players_cache.players[my_data.uid].texture);
	objects.id_name.set2(my_data.name,150);
	
	//номер комнаты в зависимости от рейтинга игрока
	const rooms_bins=[0,1350,1400,1483,9999];
	for (let i=1;i<rooms_bins.length;i++){
		const f=rooms_bins[i-1];
		const t=rooms_bins[i];		
		if (my_data.rating>f&&my_data.rating<=t){
			room_name='states'+i;
			break;
		}
	}
	
	//room_name= 'states5';	
	
	//устанавливаем рейтинг в попап
	objects.id_rating.text=objects.my_card_rating.text=my_data.rating;
	
	//обновляем почтовый ящик
	fbs.ref("inbox/"+my_data.uid).set({sender:"-",message:"-",tm:"-",data:{x1:0,y1:0,x2:0,y2:0,board_state:0}});

	//подписываемся на новые сообщения
	fbs.ref("inbox/"+my_data.uid).on('value', (snapshot) => { process_new_message(snapshot.val());});

	//обновляем данные в файербейс так как могли поменяться имя или фото
	fbs.ref('players/'+my_data.uid+'/name').set(my_data.name);
	fbs.ref('players/'+my_data.uid+'/pic_url').set(my_data.pic_url);
	fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
	fbs.ref('players/'+my_data.uid+'/country').set(my_data.country);
	fbs.ref('players/'+my_data.uid+'/auth_mode').set(my_data.auth_mode);
	await fbs.ref('players/'+my_data.uid+'/tm').set(firebase.database.ServerValue.TIMESTAMP);
	
	//устанавливаем мой статус в онлайн
	set_state({state : 'o'});
	
	//сообщение для дубликатов
	client_id = irnd(10,999999);
	fbs.ref('inbox/'+my_data.uid).set({message:'CLIEND_ID',tm:Date.now(),client_id});

	//отключение от игры и удаление не нужного
	//fbs.ref('inbox/'+my_data.uid).onDisconnect().remove();
	fbs.ref(room_name+"/"+my_data.uid).onDisconnect().remove();

	//это событие когда меняется видимость приложения
	document.addEventListener("visibilitychange", vis_change);

	//keep-alive сервис
	setInterval(function()	{keep_alive()}, 40000);
	
	//контроль за присутсвием
	const connected_control = fbs.ref('.info/connected');
	connected_control.on('value', (snap) => {
		if (snap.val() === true) {
			connected = 1;
			my_log.add({event:'connected',tm:Date.now()});
		} else {
			connected = 0;
			my_log.add({event:'not_connected',tm:Date.now()});
		}
	});
	
	//событие ролика мыши в карточном меню и нажатие кнопки
	window.addEventListener("wheel", (event) => {chat.wheel_event(Math.sign(event.deltaY))});	
	window.addEventListener('keydown',function(event){keyboard.keydown(event.key)});

	//загрузка сокета
	await auth2.load_script('https://akukamil.github.io/common/my_ws.js');	
	
	//ждем загрузки чата
	await Promise.race([
		chat.init(),
		new Promise(resolve=> setTimeout(() => {console.log('chat is not loaded!');resolve()}, 5000))
	]);

	//сообщение от админа
	await check_admin_info();
	
	//убираем лупу
	some_process.loup_anim = function(){};
	objects.id_loup.visible=false;
		
	//ждем и убираем попап
	await new Promise((resolve, reject) => setTimeout(resolve, 1000));
	anim2.add(objects.id_cont,{y:[objects.id_cont.y,-180]}, false, 0.6,'easeInBack');	
	
	//показыаем основное меню
	main_menu.activate();
	
	console.clear()

}

function main_loop() {

	game_tick+=0.016666666;
	
	//обрабатываем минипроцессы
	for (let key in some_process)
		some_process[key]();	
	
	anim2.process();

	requestAnimationFrame(main_loop);
}
