var M_WIDTH=800, M_HEIGHT=450;
var app, game_res, game, objects={}, state="",my_role="", game_tick=0, my_turn=false, room_name = '', move=0, game_id=0, connected = 1, LANG = 0,git_src;
var any_dialog_active=0, some_process = {}, h_state=0, game_platform="", hidden_state_start = 0;
var WIN = 1, DRAW = 0, LOSE = -1, NOSYNC = 2,no_invite=false;
g_board=[];
var pending_player="", opponent=null;
var my_data={opp_id : ''},opp_data={};
var g_process=function(){};
const op_pieces = ['p','r','n','b','k','q'];
const my_pieces = ['P','R','N','B','K','Q'];

var stockfish = new Worker('stockfish.js');
const chess = new Chess();

irnd = function (min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const rgb_to_hex = (r, g, b) => '0x' + [r, g, b].map(x => {
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('')

class player_mini_card_class extends PIXI.Container {

	constructor(x,y,id) {
		super();
		this.visible=false;
		this.id=id;
		this.uid=0;
		this.type = "single";
		this.x=x;
		this.y=y;
		this.bcg=new PIXI.Sprite(game_res.resources.mini_player_card.texture);
		this.bcg.interactive=true;
		this.bcg.buttonMode=true;
		this.bcg.pointerdown=function(){cards_menu.card_down(id)};
		this.bcg.pointerover=function(){this.bcg.alpha=0.5;}.bind(this);
		this.bcg.pointerout=function(){this.bcg.alpha=1;}.bind(this);
		this.bcg.width = 200;
		this.bcg.height = 100;
		
		this.avatar=new PIXI.Sprite();
		this.avatar.x=20;
		this.avatar.y=20;
		this.avatar.width=this.avatar.height=60;

		this.name="";
		this.name_text=new PIXI.BitmapText('...', {fontName: 'mfont',fontSize: 20});
		this.name_text.anchor.set(0.5,0.5);
		this.name_text.x=135;
		this.name_text.y=35;

		this.rating=0;
		this.rating_text=new PIXI.BitmapText('...', {fontName: 'mfont',fontSize: 25});
		this.rating_text.tint=0xffff00;
		this.rating_text.anchor.set(0.5,0.5);
		this.rating_text.x=135;
		this.rating_text.y=70;

		//аватар первого игрока
		this.avatar1=new PIXI.Sprite();
		this.avatar1.x=20;
		this.avatar1.y=20;
		this.avatar1.width=this.avatar1.height=60;

		//аватар второго игрока
		this.avatar2=new PIXI.Sprite();
		this.avatar2.x=120;
		this.avatar2.y=20;
		this.avatar2.width=this.avatar2.height=60;

		this.rating_text1=new PIXI.BitmapText('1400', {fontName: 'mfont',fontSize: 22});
		this.rating_text1.tint=0xffff00;
		this.rating_text1.anchor.set(0.5,0);
		this.rating_text1.x=50;
		this.rating_text1.y=70;

		this.rating_text2=new PIXI.BitmapText('1400', {fontName: 'mfont',fontSize: 22});
		this.rating_text2.tint=0xffff00;
		this.rating_text2.anchor.set(0.5,0);
		this.rating_text2.x=150;
		this.rating_text2.y=70;
		
		//
		this.rating_bcg = new PIXI.Sprite(game_res.resources.rating_bcg.texture);
		this.rating_bcg.width = 200;
		this.rating_bcg.height = 100;
		
		this.name1="";
		this.name2="";

		this.addChild(this.bcg,this.avatar, this.avatar1, this.avatar2, this.rating_bcg, this.rating_text,this.rating_text1,this.rating_text2, this.name_text);
	}

}

class lb_player_card_class extends PIXI.Container{

	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(game_res.resources.lb_player_card_bcg.texture);
		this.bcg.interactive=true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};


		this.place=new PIXI.BitmapText("", {fontName: 'mfont',fontSize: 25});
		this.place.tint=0xffff00;
		this.place.x=20;
		this.place.y=22;

		this.avatar=new PIXI.Sprite();
		this.avatar.x=43;
		this.avatar.y=10;
		this.avatar.width=this.avatar.height=48;


		this.name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25});
		this.name.tint=0xdddddd;
		this.name.x=105;
		this.name.y=22;


		this.rating=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25});
		this.rating.x=298;
		this.rating.tint=rgb_to_hex(255,242,204);
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
		this.name_bt=new PIXI.BitmapText('Shao Khan', {fontName: 'mfont',fontSize: 25});
		this.name_bt.x=30;
		this.name_bt.y=150;		
		
		
		this.rating_bt=new PIXI.BitmapText('1788', {fontName: 'mfont',fontSize: 25});
		this.rating_bt.x=210;
		this.rating_bt.y=30;
		
		this.level_bt=new PIXI.BitmapText('0', {fontName: 'mfont',fontSize: 35});
		this.level_bt.x=30;
		this.level_bt.y=30;
		this.level_bt.tint=0xffff00;
		
		this.frame=new PIXI.Sprite(gres.frame.texture);
		this.frame.width=280;
		this.frame.height=200;
		
		this.addChild(this.avatar,this.frame,this.name_bt,this.rating_bt,this.level_bt)
	}
	
	
	
}

anim2 = {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0,visible:false,ready:true, alpha:0},
		
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	
	any_on : function() {
		
		for (let s of this.slot)
			if (s !== null)
				return true
		return false;		
	},
	
	linear: function(x) {
		return x
	},
	
	kill_anim: function(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj)
					this.slot[i]=null;		
	},
	
	easeOutBack: function(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutElastic: function(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine: function(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic: function(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad: function(x) {
		return x * x;
	},
	
	easeOutBounce: function(x) {
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
	
	easeInCubic: function(x) {
		return x * x * x;
	},
	
	ease2back : function(x) {
		return Math.sin(x*Math.PI*2);
	},
	
	easeInOutCubic: function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake : function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
		
		
	},	
	
	add : function(obj, params, vis_on_end, time, func, anim3_origin) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);
		/*if (anim3_origin === undefined)
			anim3.kill_anim(obj);*/

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
				if (func === 'ease2back')
					for (let key in params)
						params[key][1]=params[key][0];					
					
				this.slot[i] = {
					obj: obj,
					params: params,
					vis_on_end: vis_on_end,
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
	
	process: function () {
		
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
		
	}
	
}

sound = {
	
	on : 1,
	
	play : function(snd_res,res_source) {
		
		
		if(res_source===undefined)
			res_source=gres;
		
		if (this.on === 0)
			return;
		
		if (res_source[snd_res]===undefined)
			return;
		
		res_source[snd_res].sound.play();	
		
	}
	
	
}

message =  {
	
	promise_resolve :0,
	
	async add(text, timeout) {
		
		if (this.promise_resolve!==0)
			this.promise_resolve('forced');
		
		if (timeout === undefined) timeout = 3000;
		
		//воспроизводим звук
		sound.play('message');

		objects.message_text.text=text;

		await anim2.add(objects.message_cont,{x:[-200,objects.message_cont.sx]}, true, 0.25,'easeOutBack');

		let res = await new Promise((resolve, reject) => {
				message.promise_resolve = resolve;
				setTimeout(resolve, timeout)
			}
		);
		
		
		message.promise_resolve=0;
		if (res === "forced")
			return;

		anim2.add(objects.message_cont,{x:[objects.message_cont.sx, -200]}, false, 0.25,'easeInBack');			
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

big_message = {
	
	p_resolve : 0,
		
	show: function(t1,t2, feedback_on) {
				
		if (t2!==undefined || t2!=="")
			objects.big_message_text2.text=t2;
		else
			objects.big_message_text2.text='**********';

		objects.big_message_text.text=t1;
		
		objects.feedback_button.visible = feedback_on;
		
		anim2.add(objects.big_message_cont,{y:[-180, objects.big_message_cont.sy]},true,0.4,'easeOutBack');

				
		return new Promise(function(resolve, reject){					
			big_message.p_resolve = resolve;	  		  
		});
	},

	feedback_down : async function () {
		
		if (objects.big_message_cont.ready===false || this.feedback_on === 0) {
			sound.play('locked');
			return;			
		}


		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.sy,450]}, false, 0.4,'easeInBack');	
		
		//пишем отзыв и отправляем его		
		const fb = await feedback.show(opp_data.uid);		
		if (fb[0] === 'sent') {
			const fb_id = irnd(0,50);			
			await firebase.database().ref("fb/"+opp_data.uid+"/"+fb_id).set([fb[1], firebase.database.ServerValue.TIMESTAMP, my_data.name]);
		
		}
		
		this.p_resolve("close");
				
	},

	close : function() {
		
		if (objects.big_message_cont.ready===false)
			return;

		sound.play('close');
		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.y, 450]},false,0.4,'easeInBack');
		
		this.p_resolve("close");			
	}

}

board_func={

	checker_to_move: "",
	target_point: 0,
	tex_2:0,
	tex_1:0,
	moves: [],
	move_end_callback: function(){},

	update_board: function() {

		//сначала скрываем все шашки
		objects.figures.forEach((c)=>{	c.visible=false});

		var i=0;
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {

				const piece = g_board[y][x];
				if (piece==='x') continue
				
				const is_my_piece = my_pieces.includes(piece);
				const piece_texture_name=[board.op_color,board.my_color][+is_my_piece]+piece.toLowerCase();
												
				objects.figures[i].texture = gres[piece_texture_name].texture;

				objects.figures[i].x = x * 50 + objects.board.x + 20;
				objects.figures[i].y = y * 50 + objects.board.y + 10;

				objects.figures[i].ix = x;
				objects.figures[i].iy = y;
				objects.figures[i].piece = piece;
				objects.figures[i].alpha = 1;

				objects.figures[i].visible = true;
				i++;
			}
		}

	},
	
	get_fen : function(brd) {
		
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
			if (c.visible===true&&c.ix===x&&c.iy===y)
				return c;
		return 0;
	},
	
	get_moves_on_dir (brd, f, dx, dy, max_moves, figures_to_eat) {
				
		//текущее положение
		const cx = f.ix;
		const cy = f.iy;
		let valid_moves = [];

		for (let i = 1 ; i < max_moves; i++) {
			
			let tx = cx + i * dx;
			let ty = cy + i * dy;
			
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

				let t = brd[y][x];
				if (t===f_name)
					return [x,y];
			}
		}	
	},
	
	get_valid_moves(brd, f, figures_to_eat) {
		
		let valid_moves =[];
		
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
			if (f.piece === 'P' && f.iy === 3 && board.pass_take_flag !== -1) {
				
				tx = cx - 1;
				if (tx === board.pass_take_flag)
					valid_moves.push(tx+'_'+2);				
				
				tx = cx + 1;
				if (tx === board.pass_take_flag)
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
	
	is_check(brd, king) {
		
		if (king === 'k') {
			
			//положение короля
			let king_pos = board_func.get_figure_pos(brd, king);
			king_pos = king_pos[0] + '_' + king_pos[1];
			
			//проверяем все фигуры - есть ли у них возможность есть короля
			for (var x = 0; x < 8; x++) {
				for (var y = 0; y < 8; y++) {				
					if(my_pieces.includes(brd[y][x])) {
						
						let f = {ix:x, iy:y, piece : brd[y][x]};
						let v_moves = board_func.get_valid_moves(brd, f, op_pieces);						
						if (v_moves.includes(king_pos) === true)
							return true;									
						
					}				
				}
			}	
			return false;
		}
		
		if (king === 'K') {
			
			//положение короля
			let king_pos = board_func.get_figure_pos(brd, king);
			king_pos = king_pos[0] + '_' + king_pos[1];
			
			//проверяем все фигуры - есть ли у них возможность есть короля
			for (var x = 0; x < 8; x++) {
				for (var y = 0; y < 8; y++) {				
					if(op_pieces.includes(brd[y][x])) {
						
						let f = {ix:x, iy:y, piece : brd[y][x]};
						let v_moves = board_func.get_valid_moves(brd, f, my_pieces);						
						if (v_moves.includes(king_pos) === true)
							return true;									
						
					}				
				}
			}	
			
			return false;
		}
		
	},

	check_fin(brd, piece) {
		
		//проверяем звершение игры
		let fen = board_func.get_fen(brd) + ' ' + piece + ' - - 1 1';
		chess.load(fen);
		let is_check = chess.in_check();
		let is_checkmate =  chess.in_checkmate();	
		let	is_stalemate = chess.in_stalemate();
				
		if (is_checkmate === true)
			return 'checkmate';		
		if (is_stalemate === true)
			return 'stalemate';		
		if (is_check === true)
			return 'check';
		return '';
	}
}

make_text = function (obj, text, max_width) {

	let sum_v=0;
	let f_size=obj.fontSize;

	for (let i=0;i<text.length;i++) {

		let code_id=text.charCodeAt(i);
		let char_obj=game_res.resources.m2_font.bitmapFont.chars[code_id];
		if (char_obj===undefined) {
			char_obj=game_res.resources.m2_font.bitmapFont.chars[83];
			text = text.substring(0, i) + 'S' + text.substring(i + 1);
		}

		sum_v+=char_obj.xAdvance*f_size/64;
		if (sum_v>max_width) {
			obj.text =  text.substring(0,i-1);
			return;
		}
	}

	obj.text =  text;
}

mini_dialog={
	
	type : 0,
	
	show : function (type) {
		
		if (objects.mini_dialog.visible === true || objects.big_message_cont.visible === true || anim2.any_on()===true)	{
			sound.play('locked');
			return
		}
		
		this.type = type;
		
		sound.play('mini_dialog');
		
		if (type === 'giveup')
			objects.t5.text = ['Сдаетесь?','Give Up?'][LANG];
		if (type === 'draw')
			objects.t5.text = ['Предложить ничью?','Offer a draw?'][LANG]
		if (type === 'draw_request')
			objects.t5.text = ['Согласны на ничью?','Agree to a draw?'][LANG];
		
		anim2.add(objects.mini_dialog,{y:[450,objects.mini_dialog.sy]}, true, 0.3,'linear');
	},
	
	no : async function () {	
	
		
		if (objects.mini_dialog.ready === false || 	objects.big_message_cont.visible === true  || anim2.any_on()===true)	{
			sound.play('locked');
			return
		}
		
		sound.play('click');
				
		if (this.type === 'draw_request')	
			firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"DRAWNO",tm:Date.now(),data:{}});			
		
		this.close();
		
	},
		
	yes : function () {
		
		if (objects.mini_dialog.ready === false || 	objects.big_message_cont.visible === true || anim2.any_on()===true)	{
			sound.play('locked');
			return
		}
		
		sound.play('click');
		
		if (this.type === 'giveup')		
			online_player.giveup();

		//отправить запрос на ничью
		if (this.type === 'draw')
			firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"DRAWREQ",tm:Date.now(),data:{}});
		
		//согласиться на ничью
		if (this.type === 'draw_request'){
			firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"DRAWOK",tm:Date.now(),data:{}});
			online_player.draw();				
		}
	
		
		this.close();
	},
	
	close : function() {
		
		anim2.add(objects.mini_dialog,{y:[objects.mini_dialog.y,450]}, false, 0.3,'linear');
		//any_dialog_active--;
		
	}
	
}

online_player={
	
	start_time:0,
	disconnect_time:0,
	move_time_left:0,
	timer:0,
	time_for_move:0,
	move_resolver:0,
	timer_start_time:0,
	conf_play_flag:false,
		
	send_move : function (move_data) {
		
		//this.reset_timer(false);
		
		this.me_conf_play=true;
		
		//переворачиваем данные о ходе так как оппоненту они должны попасть как ход шашками №2
		move_data.x1=7-move_data.x1;
		move_data.y1=7-move_data.y1;
		move_data.x2=7-move_data.x2;
		move_data.y2=7-move_data.y2;

		//отправляем ход сопернику
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MOVE",tm:Date.now(),data:move_data});
	},
	
	calc_new_rating : function (old_rating, game_result) {
		
		
		if (game_result === NOSYNC)
			return old_rating;
		
		var Ea = 1 / (1 + Math.pow(10, ((opp_data.rating-my_data.rating)/400)));
		if (game_result === WIN)
			return Math.round(my_data.rating + 16 * (1 - Ea));
		if (game_result === DRAW)
			return Math.round(my_data.rating + 16 * (0.5 - Ea));
		if (game_result === LOSE)
			return Math.round(my_data.rating + 16 * (0 - Ea));
		
	},
	
	activate : function (role) {
				
		//очищаем на всякий случай мк и квизы
		mk.switch_stop();	
		quiz.close();
			
		objects.board.texture=gres.board.texture;
		objects.desktop.texture=gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.5,'linear');	
		
		//ни я ни оппонент пока не подтвердили игру
		my_player.conf_play_flag=false;
		online_player.conf_play_flag=false;

		//таймер
		objects.timer.visible=true;
		
		anim2.add(objects.game_buttons_cont,{x:[900, objects.game_buttons_cont.sx]},true,0.5,'linear');
		
		//устанавливаем статус в базе данных а если мы не видны то установливаем только скрытое состояние
		set_state({state : 'p'});
		
		//фиксируем врему начала игры
		this.start_time = Date.now();
		
		//обновляем время без связи
		this.disconnect_time = 0;
		
		//вычиcляем рейтинг при проигрыше и устанавливаем его в базу он потом изменится
		let lose_rating = this.calc_new_rating(my_data.rating, LOSE);
		if (lose_rating >100 && lose_rating<9999)
			firebase.database().ref("players/"+my_data.uid+"/rating").set(lose_rating);
		
		if (role === 'master')
			g_board = [['r','n','b','q','k','b','n','r'],['p','p','p','p','p','p','p','p'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']];
		else
			g_board = [['r','n','b','k','q','b','n','r'],['p','p','p','p','p','p','p','p'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['P','P','P','P','P','P','P','P'],['R','N','B','K','Q','B','N','R']];

		
		game.activate(role,online_player)

	},
	
	giveup(){
		//это когда я сдаюсь
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"GIVEUP",tm:Date.now(),data:{}});		
		if(this.move_resolver!==0)
			this.move_resolver('player_gave_up');
		if(my_player.move_resolver!==0)
			my_player.move_resolver(['player_gave_up']);
		
	},
	
	draw(){
		//это когда ничья согласована
		if(this.move_resolver!==0)
			this.move_resolver('draw');
		
		if(my_player.move_resolver!==0)
			my_player.move_resolver(['draw']);
		
	},
	
	opp_giveup(){
		//это когда я сдаюсь
		if(this.move_resolver!==0)
			this.move_resolver('op_gave_up');
		
		if(my_player.move_resolver!==0)
			my_player.move_resolver(['op_gave_up']);		
	},
	
	activate_timer(){
			
		if(objects.timer.visible===false) return;
		
		this.timer_start_time=Date.now();
		
		this.timer=setInterval(online_player.time_tick.bind(online_player),1000);
		
		this.conf_play_flag
			? this.time_for_move=45
			: this.time_for_move=15
			
		objects.timer.text = '0:'+this.time_for_move;
		objects.timer.x=575;
		objects.timer.tint=0xffffff;	
		
	},
	
	async wait_move(){		
		
 		// таймер
		this.activate_timer();
		
		const move_data=await new Promise(resolver=>{
			this.move_resolver=resolver;
		})
				
		clearTimeout(this.timer);	
		
		if(['draw','op_timeout','op_no_sync','op_gave_up','player_gave_up'].includes(move_data))
			return [move_data];
		
		this.conf_play_flag=true;
		
		return await board.process_op_move(move_data);
		
	},
		
	time_tick(){
		
		const time_passed=~~((Date.now()-this.timer_start_time)*0.001);
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
		
		//если время закончилось
		if(time_left<=-5){			
			this.conf_play_flag
				? this.move_resolver('op_timeout')
				: this.move_resolver('op_no_sync');
		}
		
	},
		
	stop : async function(final_state) {					
		
		//отключаем взаимодейтсвие с доской
		objects.board.pointerdown=null;
		
		//отключаем таймер
		objects.timer.visible=false;
		clearTimeout(this.timer_id);	
		
		//элементы только для данного оппонента	
		objects.game_buttons_cont.visible=false;
				
		let res_db = {
			'my_no_connection' 		: [['Потеряна связь!\nИспользуйте надежное интернет соединение.','Lost connection!\nuse a reliable internet connection'], LOSE],
			'stalemate_to_opponent' : [['Пат!\nИгра закончилась ничьей.','Stalemate!\nthe game ended in a draw'], DRAW],
			'stalemate_to_player' 	: [['Пат!\nИгра закончилась ничьей.','Stalemate!\nthe game ended in a draw'], DRAW],
			'draw' 					: [['Игра закончилась ничьей.','The game ended in a draw'], DRAW],
			'checkmate_to_opponent' : [['Победа!\nВы поставили мат!','Victory!\nYou checkmated'], WIN],
			'checkmate_to_player' 	: [['Поражение!\nВам поставили мат!','Defeat!\nYou have been checkmated'], LOSE],
			'op_gave_up' 			: [['Победа!\nСоперник сдался.','Victory!\nThe opponent gave up'], WIN],
			'player_gave_up' 		: [['Поражение!\nВы сдались.','Defeat!\nyou gave up'], LOSE],
			'timer_error' 			: [['Поражение!\nОшибка таймера.','Defeat!\nTimer error'], LOSE],
			'op_timeout' 			: [['Победа!\nСоперник не сделал ход.','Victory!\nthe opponent did not make a move'], WIN],
			'my_timeout' 			: [['Поражение!\nУ вас закончилось время.','Defeat!\nyou have run out of time'], LOSE],
			'op_no_sync' 			: [['Похоже соперник не смог начать игру','It looks like the opponent could not start the game'], NOSYNC],
			'my_no_sync' 			: [['Похоже Вы не смогли начать игру','It looks like you could not start the game'], NOSYNC],
			'draw_50' 				: [['Ничья!\nЗа последние 50 ходов не было взятий фигур и продвижения пешек','A draw!\nfor the last 50 moves there have been no taking of pieces and pawn promotion'], NOSYNC]	
		}
		
		let res_info = res_db[final_state];
		
		//обновляем рейтинг
		let old_rating = my_data.rating;
		my_data.rating = this.calc_new_rating (my_data.rating, res_info[1]);
		firebase.database().ref("players/"+my_data.uid+"/rating").set(my_data.rating);

		//обновляем даные на карточке
		objects.my_card_rating.text=my_data.rating;

		//играем звук
		game.play_finish_sound(res_info[1]);

		//записываем результат игры в базу данных
		if (res_info[1] === DRAW || res_info[1] === LOSE || res_info[1] === WIN) {
			
			//записываем результат в базу данных
			const duration = ~~((Date.now() - this.start_time)*0.001);
			firebase.database().ref("finishes/" + game_id + my_role).set({'player1':objects.my_card_name.text,'player2':objects.opp_card_name.text, 'res':res_info[1], 'fin_type':final_state,'duration':duration, 'ts':firebase.database.ServerValue.TIMESTAMP});
		
			//увеличиваем количество игр
			my_data.games++;
			firebase.database().ref("players/"+[my_data.uid]+"/games").set(my_data.games);	

			let check_players =[
				'ls3844970',
				'meZ2SiSr91BSgxoD763cGrZZww5sWo98rvrr9tARYj0=',
				'ls1807543',
				'ls3996035',
				'RPYlNOh4Dpv5g2IiZc+Sc6en0gy0InfpdsZwPHJzlbE=',
				'vk157725076',
				'4MqwsTmjkY9YTwsZP+VlTiS7Zi6+XwOERw8Bj+yfzmY=',
				'0bKUa5fOJS6hNU53qzI459VAbM7VCNluAMEXPcmFo6Q=',
				'JERga13Sq681XyhSDd6tns8piJi57EtPCsuXZ9jFOkg=',
				'ls9359789',
				'pqLNTN3nGPlhgHHzDZj9Oe+M6c1bqSZAHaNCfGWCZ4g=',
				'AWgYaqbra7yaWLwSKm27DiwZxgc4M1LIn+z7AxVT8us=',
				'NizqlONZS6sQge1lJTi9ytVjhJ4jqUWJmZZmnjqVghQ=',
				'QdHMDnRWAhSDuDV2yDm6f5jXUItmr0USiomyU4ga874=',
				'2ghP9ja8vONuZep9zxQj6IXUY7uFdp5ZAhjZ64Z8+bc=',
				'ls934420',
				'ls9152430',
				'jRD+TXmyb3wsZV8+34Z7ovZqQndV2SImUSy88rlVhZo=',
				'JzJ06g2JqepeWjD7U6vOBXaUFVSRGlhgA8ZF6uLlRjU=',
				'ls9894724'
			]
			
			if (check_players.includes(my_data.uid) || check_players.includes(opp_data.uid)) {
				firebase.database().ref("finishes2").push({'player1':objects.my_card_name.text,'player2':objects.opp_card_name.text, 'res':res_info[1], 'fin_type':final_state,'duration':duration, 'ts':firebase.database.ServerValue.TIMESTAMP});
			}			
		
		}
		
		await big_message.show(res_info[0][LANG], `${['Рейтинг:','Rating:'][LANG]} ${old_rating} > ${my_data.rating}`, true);
				
		//останавливаем все остальное
		game.stop();		
	},
	
	reset_timer : function(is_my_move) {
		
		//обовляем время разъединения
		this.disconnect_time = 0;
		
		//перезапускаем таймер хода
		this.move_time_left = 45;
		
		//обновляем на табло
		objects.timer.text = '0:'+this.move_time_left;

		objects.timer.x = [575,225][+is_my_move];

		objects.timer.tint = 0xffffff;
		
	}

};

quiz={
	
	on:false,
	moves_to_mate:2,
	
	quiz_data:[
	['8/6k1/8/6N1/5K2/7Q/8/8','Bajtay, Jozsef\nL_Italia Scacchistica\nSep 1971',2],
	['8/8/k7/5R2/4K3/3R4/8/8','Burbach, Johannes Jacob\nDeutsche Schachzeitung\nApr 1983',2],
	['6R1/7k/5K2/8/6N1/8/8/8','Cabrera, Darwin\nChess, 18\nDec 1964',2],	
	['8/8/8/8/4R3/6k1/8/4K2R','Candy, W. E.\nUnknown\n1911',2],	
	['8/8/3K4/8/3k4/5Q2/2R5/8','Carpenter, George Edward\nDubuque Chess Journal\nOct 1873 (724)',2],	
	['7K/3Q4/8/6k1/8/6N1/8/8','Chiasson, Joseph Emile\nEchec+\n1992',2],		
	['8/4K3/8/5k2/8/4B3/4Q3/8','Conroy, J. A.\nHome Circle\n1850',2],	
	['8/Q7/8/8/8/6N1/4K2k/8','Gruber, Hans\nSachsische Zeitung\n5 Jun 1981 (1087)',2],	
	['8/8/5Q2/3k4/8/1K6/2R5/8','Holladay, Edgar Dinwiddie\nThe Problemist\nJul 1990 (7904)',2],	
	['8/6P1/P7/8/8/8/8/k1K5','Speckmann, Werner\nEurope Echecs\n1965 (494)',3],
	['k5N1/8/8/8/8/5K2/8/1Q6','Libis, Zdenek\nSachove umeni\nFeb 1971 (2655)',3],
	['8/8/8/8/k7/7R/1K6/5B2','Klager, K. M.\nWormser Zeitung\n1964 (527)',3],
	['8/8/8/8/8/R3K3/8/2B1k3','Mabmann, Wilhelm Karl Heinrich\nBasler Nachrichten\n10 Jul 1954 (4326)',3],
	['5b1k/3P4/5K2/8/8/8/8/8','Olausson, Michel\nTroll, 1991',3],
	['2k5/5R2/8/2K5/8/8/8/2B5','Kakabadze, Ferad\nTroll\n29 Aug 2001 (551)',3],
	['8/8/8/8/6K1/8/5P1Q/5k2','Erdenbrecher, Hans Michael\nDie Schwalbe\nFeb 1971 (321)',3],
	['1K6/4kP2/2Q5/8/8/8/8/8','Демидюк, Степан Иосифович\nTT Apprenti Sorcier\n1993',3],
	['k1n5/2QK4/8/8/8/8/8/8','Богданов, Евгений Михайлович\nMat-64Comm.Mat-64\n2000 (81)',3],
	['8/1Q6/2p5/4K3/8/k7/8/8','Havel, Miroslav\nSachove umeni\n20 Sep 1951',3],
	['8/8/8/8/p7/3N4/2K5/k7','Kollarik, Gorazd\nHlas Iudu\n13 Mar 1975 (459)',3],
	['5B1k/8/6K1/8/8/7N/8/8','Majoros, Bela\nSakkelet\n1994 (5-6/5971)',3],
	['7k/8/6Qn/6K1/8/8/8/8','Румянцев, Сергей Юрьевич\nЮный ленинец (Кишинев)\n1974',3],
	['3r4/3kPK2/2R5/8/8/8/8/8','Teixeira, Nelson\nO Globo\n1982',3],
	['8/3p1N2/K7/2k5/4Q3/8/8/8','Makaronez, Leonid\nL_Italia Scacchistica\nMar 1998 (8256)',3],
	['1k6/1P3QK1/8/8/8/8/P7/8','Максимовских, Александр Петрович\nШахматы в СССР\nFeb 1966 (12)',3],
	['8/K2p4/2k5/6Q1/8/1B6/8/8','Кожакин, Владимир Владимирович\nL_Italia Scacchistica\nDec 1998 (8609)',3],
	['8/5k2/8/4Q3/3P4/8/8/2B4K','Кулигин, Микола Володимирович\nКудесник, 1993',3],
	['3k4/3N4/3K4/8/8/3N4/8/3B4','Fargette, Bruno\nThemes-64\nJul 1966 (1478)',4],
	['7k/7B/7K/8/8/8/8/R6b','Meynsbrughen, Michel\nperso.infonie.fr/clafouti\n1999',4],
	['8/8/7K/B4Q2/3k4/8/4P3/8','Havel, Miroslav\nParallele 50\n22 Nov 1951',4],
	['8/7R/8/8/8/8/5K1p/3b3k','Mlynka, Karol\nSmer\n1968',4],
	['8/8/8/8/8/7p/7R/1kNK4','Zucker, Manfred\nMagyar Sakkelet\n1984 (1/4752)',4],
	['Q7/1B6/1k6/3K4/8/8/1p6/8','Пипа, Володимир Иосифович\nШах-ВВ (Боровичи)\n1991',4],
	['8/8/8/8/8/3p2K1/3N4/4N2k','Brieger, Robert Sinclair\nThe Joy of Mate\n1985 (33)',4],
	['k1K5/4R3/4P3/P7/8/8/8/8','Speckmann, Werner\nstella polaris\nMar 1966 (123)',4],
	['8/B7/8/3K1k2/8/5NR1/8/8','Makaronez, Leonid\nThe Problemist Supplement\nJul 2006 (83/1817)',4],  //5 фигур	
	['N7/5k2/N6Q/6p1/8/6K1/8/8','Havel, Miroslav\nParallele 50, 3 Jul 1952',4],//6фигур
	['3Q4/8/8/2p5/2p5/3B1K2/3k4/8','Carpenter, George Edward\nSchachminiaturen, 1902',4],
	['r3k3/5R1K/8/8/1n6/8/8/6R1','Poisson, Olivier\ndiagrammes, Sep 1981 (53/1169)',4],
	['6K1/7P/7P/1R6/8/8/kP6/8','Makaronez, Leonid\nProblemas, Jul 1994 (7/1112)',4],
	['8/8/8/8/7R/1P1kp3/7R/1K6','Богданов, Е.М.\nMat-64, Mar 2000 (45)',4],
	['4Q3/8/8/3k4/3p4/3P4/3B4/K7','Кожакин, Владимир Владимирович\nMat-64, 2001 (259)',4],
	['8/8/8/8/3NK3/4N3/8/2B1k2B','Clavero, P.\nEurope Echecs, Apr 1990 (376/10)',4],
	['7k/5p2/8/5BR1/5K2/6B1/8/8','Кардымон, Геннадий П.\nКудесник, 1992',4],
	['8/3k4/1BN2PB1/1K6/8/8/8/8','Pajor, Andras\nMagyar Sakkelet, 1989 (3/5347)',4],
	['2B5/8/1B1k1N2/8/3NK3/8/8/8','Majoros, Bela\nSakkelet, 1995 (4/6075)',4],
	['8/8/6B1/6B1/6kp/7N/6K1/8','Barna, Laszlo\nSakkelet, 1997 (9-10/6358)',4],
	['7K/3B4/8/8/1Bk5/4R3/2N5/8','Кожакин, Владимир Владимирович\nSakkelet, 1999 (1-2/6517)',4],
	['8/1K6/8/B1k2N2/2B5/4N3/8/8','Shahaf, Noam\nProblemas, Mar 2000 (27/1615)',4],
	['7R/8/3K4/8/3k4/3P3p/1R6/8','Богданов, Евгений Михайлович\nTroll, 2000',4],
	['1R6/3N4/2N1k3/8/4K3/8/8/B7','Иванов, Валерий Алексеевич\nЗадачи и этюды, Apr 2006 (38/2478)',4],
	['8/3N4/K7/8/4k1N1/b1Q5/8/8','Навроцкий, Игорь\nШаховий Леополіс, 2006 (7)',4]
	
	],
		
	async activate(){				
				
		//устанавливаем статус в базе данных а если мы не видны то установливаем только скрытое состояние
		set_state({state : 'b'});
		
		this.on=true;
		
		//смотрим сколько людей решили
		let pc=await firebase.database().ref("quizes/"+my_data.quiz_level ).once('value'); 
		pc=pc.val();
						
		//новая игра стокфиша
		sf.new_game(10,7);	
		
		//воспользуемся кнопкой из бота чтобы выйти
		objects.sb_bcg.pointerdown=this.exit_down.bind(quiz);
		anim2.add(objects.stop_bot_button,{x:[800,objects.stop_bot_button.sx]},true,0.5,'linear');
		
		const q=this.quiz_data[my_data.quiz_level];
		g_board = board_func.fen_to_board(q[0]);
		
		this.moves_to_mate=q[2];
		objects.quiz_title0.text=['Задача №','Problem №'][LANG]+(my_data.quiz_level+1);
		objects.quiz_title1.text=[`**Мат за ${q[2]} хода**`,`**Mate in ${q[2]} moves**`][LANG];
		objects.quiz_title2.text=q[1];
		objects.quiz_title3.text=['Количество игроков решивших данную задачу:\n','The number of players who solved this problem:\n'][LANG]+(pc||0);
		anim2.add(objects.quiz_title_cont,{alpha:[0,1]},true,2,'linear');
		
		game.activate('master',quiz)
		
	},
	
	async update_quiz_stat(quiz_id){
		
		//смотрим сколько людей решили
		let pc=await firebase.database().ref("quizes/"+quiz_id ).once('value'); 
		pc=pc.val();
		
		if (pc!==null && pc!==undefined)
			firebase.database().ref("quizes/"+quiz_id ).set(pc+1); 
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
	
	async wait_move() {
			
		const move_data=await sf.wait_move();		
		if (move_data==='stop') return 'stop';
		
		return await board.process_op_move(move_data);
		
	},
	
	close(){
		
		objects.mk_exit_button.visible=false;
		sf.stop();
		if(objects.quiz_title_cont.visible)
			anim2.add(objects.quiz_title_cont,{alpha:[1,0]},false,0.5,'linear');
		
		//убираем кнопку выхода
		anim2.add(objects.stop_bot_button,{x:[objects.stop_bot_button.x,800]},false,0.5,'linear');
		
		this.on=false;
		game.clear_elements();
		
	},
	
	stop : async function(final_state) {
		
		//отключаем стокфиш
		sf.stop();
		
		//отключаем цикл игры
		my_player.move_resolver(['stop']);
						
		//отключаем взаимодейтсвие с доской
		objects.board.interactive=false;
		
		//убираем кнопку выхода
		anim2.add(objects.stop_bot_button,{x:[objects.stop_bot_button.x,800]},false,0.5,'linear');
						
		//элементы только для данного оппонента
		objects.step_back_button.visible = false;
		let t=''
		
		
		if (final_state === 'checkmate_to_opponent'){
						
			//омечаем что эта задача решена
			if(my_data.quiz_level>=this.quiz_data.length-1){
				
				message.add(['Это последняя задача, но скоро будут новые...','This is the last problem, but there will be new ones soon...'][LANG])		
				
			}else{
				
				this.update_quiz_stat(my_data.quiz_level);	
				my_data.quiz_level++;
				firebase.database().ref("players/"+my_data.uid+"/quiz_level").set(my_data.quiz_level);
			}
			
			sound.play('win');
			t = [['Задача решена!','The problem is solved'],999]		
						
		} else {
			
			sound.play('lose');
			t = [['Вы не решили задачу!','The problem is not solved'],999]		
		}		
		
		await big_message.show(t[0][LANG],'---)))---', false);
				
		game.clear_elements();
		
		ad.show();

		//снова активируем
		this.activate();		
	},
	
	send_move(){
		
		
	},
}

mk={	
	res:null,
	cur_mk_level:0,
	start_time:0,
	cur_enemy:null,
	first_run:true,
	voices_order:[],
	voice_ind:0,
	played_num:0,

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
	{name:'Mileena',rating:1455,pic_res:'kenshi_img',depth:3,skill_level:4,sounds:9},
	{name:'Robocop',rating:1412,pic_res:'robocop_img',depth:1,skill_level:2,sounds:12},	
	{name:'Jade',rating:1455,pic_res:'jade_img',depth:2,skill_level:3,sounds:7},
	{name:'Rain',rating:1403,pic_res:'rain_img',depth:1,skill_level:1,sounds:10}],
	
	activate:async function(){
		
		//расставляем карточки
		for(let i=0;i<15;i++){	
			const fighter_data=this.fighters_data[i];
			objects.mk_fighters_cards[i].y=i*200;
			objects.mk_fighters_cards[i].avatar.texture=gres[fighter_data.pic_res].texture;
			objects.mk_fighters_cards[i].name_bt.text=fighter_data.name;
			objects.mk_fighters_cards[i].rating_bt.text=fighter_data.rating;
			objects.mk_fighters_cards[i].level_bt.text=15-i;
			
			if (i<my_data.mk_level)
				objects.mk_fighters_cards[i].avatar.alpha=0.25;
			else
				objects.mk_fighters_cards[i].alpha=1;
		}
				
		//первый запуск лесницы		
		objects.desktop.texture=gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0, 1]},true,1,'linear');

		objects.vs_icon.visible=false;
		objects.mk_my_card.visible=false;
		objects.mk_my_avatar.texture=objects.my_avatar.texture;
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
		
		this.first_run=false;

	},
	
	shift_ladder: async function(level, time, shift){
		
		
		const cur_y=objects.mk_fighters_cards_cont.y+shift;
		const tar_y=450-200*(level+1);
		const anim_time=Math.abs(cur_y-tar_y)/1000+0.5;

		
		
		await anim2.add(objects.mk_fighters_cards_cont,{y:[objects.mk_fighters_cards_cont.y+shift, tar_y]},true,anim_time,'easeInOutCubic');
		
	},
	
	async wait_move() {
			
		const move_data=await sf.wait_move();		
		if (move_data==='stop') return 'stop';
		
		
		//воспроизводим звук
		if (Math.random()>0.9){
			sound.play(mk.cur_enemy.name+mk.voices_order[mk.voice_ind],mk.res.resources);		
			mk.voice_ind++;
			mk.voice_ind=mk.voice_ind%mk.cur_enemy.sounds;
			
		}
		
		
		return await board.process_op_move(move_data);
		
	},
	
	close_ladder:async function(){
		
		anim2.add(objects.mk_fighters_cards_cont,{x:[objects.mk_fighters_cards_cont.x, 800]},false,0.5,'linear');
		anim2.add(objects.vs_icon,{y:[objects.vs_icon.y, 450]},false,0.5,'linear');
		anim2.add(objects.mk_start_button,{x:[objects.mk_start_button.x,800]},false,0.5,'linear');
		anim2.add(objects.mk_up_button,{x:[objects.mk_up_button.x,800]},false,0.5,'linear');
		anim2.add(objects.mk_down_button,{x:[objects.mk_down_button.x,800]},false,0.5,'linear');
		anim2.add(objects.mk_exit_button,{x:[objects.mk_exit_button.x,-100]},false,0.5,'linear');
		await anim2.add(objects.mk_my_card,{x:[objects.mk_my_card.x, -200]},false,0.5,'linear');		
		
	},
	
	play_down:async function(){
		
		if (anim2.any_on()===true){
			sound.play('locked');
			return;	
		}
		
		sound.play('click');
		
		await this.close_ladder();
		
		this.init();
	
	},

	stop : async function(final_state) {
		
		//отключаем стокфиш
		sf.stop();
		
		//отключаем цикл игры
		my_player.move_resolver(['stop']);
						
		//отключаем взаимодейтсвие с доской
		objects.board.interactive=false;
		
		objects.timer.visible=false;
						
		//элементы только для данного оппонента
		objects.stop_bot_button.visible = false;
		objects.step_back_button.visible = false;
		let t=''
		
		if ( final_state === 'stop')
			t = [['Вы отменили смертельную битву','You canceled mortal kombat'],999]		
		
		if ( final_state === 'stalemate_to_opponent' || final_state === 'stalemate_to_player')
			t = [['Пат!\nИгра закончилась ничьей.','Stalemate!\nthe game ended in a draw'],DRAW]		
				
		if (final_state === 'checkmate_to_opponent')
			t = [['Победа!\nВы поставили мат!','Victory!\nYou checkmated'],WIN]				
		
		if (final_state === 'checkmate_to_player')			
			t = [['Поражение!\nВам поставили мат!','Defeat!\nYou have been checkmated'],LOSE]		
		
		if (final_state === 'draw_50')			
			t = [['Ничья!','Draw!'],DRAW]		
		
		if (final_state === 'checkmate_to_opponent'){
			
			sound.play(['mk_impressive','mk_outstanding','mk_excelent'][irnd(0,2)]);
			
			const next_level=this.cur_mk_level-1;
			if (this.cur_mk_level>0)
				my_data.mk_level=Math.min(next_level,my_data.mk_level);
			firebase.database().ref("players/"+my_data.uid+"/mk_level").set(my_data.mk_level);
			
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
				firebase.database().ref("players/"+my_data.uid+"/mk_sback_num").set(my_data.mk_sback_num);
			} 			
		}
		
		game.clear_elements();
		
		ad.show();

		//снова активируем лестницу
		this.activate();		
	},
	
	stop_down : function () {
		
		if (anim2.any_on() === true || objects.td_cont.visible === true || objects.big_message_cont.visible === true ||objects.req_cont.visible === true ||objects.invite_cont.visible === true) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		
		this.stop('stop');		
	},
		
	send_move(){
		
		
	},
		
	step_back:function(){
				
		if(!my_turn || anim2.any_on() || board.prv_state.board===undefined){
			sound.play('locked')
			return;			
		}
		
		
		sound.play('mk_haha2');
		
		my_data.mk_sback_num--;
		if (my_data.mk_sback_num===0)
			anim2.add(objects.step_back_button,{x:[objects.step_back_button.x, 900]},false,0.6,'easeInBack');
		objects.sback_title.text=['Шаг назад ','Step back '][LANG]+'('+my_data.mk_sback_num+')';
		
		firebase.database().ref("players/"+my_data.uid+"/mk_sback_num").set(my_data.mk_sback_num);
		
		objects.selected_frame.visible=false;
		this.selected_piece=0;
		g_board=JSON.parse(JSON.stringify(board.prv_state.board));
		board.move_flags=JSON.parse(JSON.stringify(board.prv_state.move_flags));
		for (let [key, spr] of Object.entries(board.eaten_labels))
			spr.text=spr.val=board.prv_state.eaten_labels[key];
		board_func.update_board();
		
	},
		
	switch_stop : function () {
  		
		if (objects.mk_fighters_cards_cont.visible)
			this.close_ladder();
		
		//отключаем стокфиш
		sf.stop();
		
		//отключаем комманды
		stockfish.removeEventListener('message', mk.stockfish_response);
						
		//отключаем взаимодейтсвие с доской
		objects.board.pointerdown=null;
		
		objects.timer.visible=false;
						
		//элементы только для данного оппонента
		objects.stop_bot_button.visible = false;
		objects.step_back_button.visible = false;
		
		game.clear_elements();
		
	},

	shuffle_array : function(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	},

	init: async function(){
		
		this.cur_enemy=this.fighters_data[this.cur_mk_level];
		
		//подгружаем ресурсы
		if (this.res===null) this.res=new PIXI.Loader();
		for(let i=0;i<this.cur_enemy.sounds;i++){
			const sres_name=this.cur_enemy.name+i;
			if (!this.res.resources[sres_name])
				this.res.add(sres_name,git_src+'sounds/'+this.cur_enemy.name+'/'+i+'.mp3');
		}
			
		await new Promise((resolve, reject)=> this.res.load(resolve))
		
		
		this.voice_ind=0;
		this.voices_order=Array.from(Array(this.cur_enemy.sounds).keys())
		this.shuffle_array(this.voices_order);
		
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.5,'linear');	
		//objects.board.alpha=0.85;
				
		sound.play('mk_ring');
		
		anim2.add(objects.stop_bot_button,{x:[900, objects.stop_bot_button.sx]},true,0.5,'linear');
		objects.sb_bcg.pointerdown=mk.stop_down.bind(mk);
		
		//возможность вернуть доску на шаг назад
		if(my_data.mk_sback_num>0){
			objects.sback_title.text=['Шаг назад ','Step back '][LANG]+'('+my_data.mk_sback_num+')';		
			anim2.add(objects.step_back_button,{x:[900, objects.step_back_button.sx]},true,0.6,'linear');
		}
	
		objects.opp_avatar.texture=new PIXI.Texture(gres[this.cur_enemy.pic_res].texture.baseTexture, new PIXI.Rectangle(40,0,160,160));
		objects.opp_card_name.text=this.cur_enemy.name;
		objects.opp_card_rating.text=this.cur_enemy.rating;
				
		//обновляем на табло
		objects.timer.visible=true;
		objects.timer.x = 225;
		objects.timer.text = ['Мой ход','My move'][LANG];
		
		//устанавливаем статус в базе данных а если мы не видны то установливаем только скрытое состояние
		set_state({state : 'b'});
		
		//доска для смертельной битвы
		g_board = [['x','x','x','x','k','x','n','r'],['p','p','p','p','p','p','p','p'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']];
		//g_board = [['r','n','b','q','k','b','n','r'],['p','p','p','p','p','p','p','p'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']];

		//инициируем общие ресурсы игры
				
		
		sf.new_game(this.cur_enemy.skill_level,this.depth);
		game.activate('master',mk);
		
	},
	
	exit_down:async function(){
		
		if (anim2.any_on()===true){
			sound.play('locked');
			return;	
		}
		
		sound.play('click');
		
		await this.close_ladder();
		
		main_menu.activate();
		
	},
	
	up_down:function(){
		
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
	
	down_down:function(){
		
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
		
	reset_timer_when_move : function() {
		
	}
		
}

sf={
	
	move_resolver:0,
	skill_level:0,
	depth:0,
	
	response(e){
		
		if (e.data.substring(0, 8) !== 'bestmove')
			return;
		this.move_resolver(e);
		
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
		if(this.move_resolver!==0)
			this.move_resolver('stop');		
		
	},
		
	async wait_move(){
									

		
		//указываем есть ли возможность рокировки у бота
		let castling=' ';
		if (board.move_flags[0][4]===0 && board.move_flags[0][7]===0)
			castling+='k';
		if (board.move_flags[0][4]===0 && board.move_flags[0][0]===0)
			castling+='q';		
		
		//формируем фен строку и запускаем поиск решения				
		const fen = board_func.get_fen(g_board) + ' b' + castling;	
		
		stockfish.postMessage('position fen ' + fen);		
		stockfish.postMessage('go depth '+this.depth);
		
		const sf_data=await new Promise(resolver=>{
			this.move_resolver=resolver;
		})					
		if(sf_data==='stop') return 'stop';
						
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
		if (op_pieces.includes(pawn_replace) === true)
			move_data.pawn_replace = pawn_replace;		
				
		return move_data;
	}	
	
}

board={
	
	prv_state:0,	
	valid_moves : 0,
	selected_piece:0,	
	move_flags:[],
	eaten_labels:0,
	prv_state:null,
	my_color:'w',
	op_color:'b',
	draw_50:0,
	pass_take_flag:0,
	player_under_check:false,
	is_my_first_move:false,
	
	init(role){
		
		this.move_flags=[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
		
		my_turn=this.is_my_first_move=role==='master';
		
		//предыдущее состояние доски
		this.prv_state={};
		
		//определяем цвет фигур
		this.my_color=['b','w'][+this.is_my_first_move];
		this.op_color=['w','b'][+this.is_my_first_move];
		
		//пока никто не подтвердил игру
		this.me_conf_play=false;
		this.op_conf_play=false;
		
		//надписи съеденых фигур
		this.eaten_labels={p:objects.my_pn,r:objects.my_rn,n:objects.my_nn,b:objects.my_bn,q:objects.my_qn,P:objects.opp_pn,R:objects.opp_rn,N:objects.opp_nn,B:objects.opp_bn,Q:objects.opp_qn};
		for (let [x, t] of Object.entries(this.eaten_labels)) {
			t.val=t.text=0;
		}
		
		//никакая фигура не быбрана
		this.selected_piece=0;		
		
		//предыдущее состояние доски
		this.prv_state={};
		
		//общие элементы для игры		
		objects.selected_frame.visible=false;
		objects.cur_move_text.visible=true;

		anim2.add(objects.board,{alpha:[0, 1]},true,0.4,'linear');
		anim2.add(objects.my_card_cont,{x:[-100, objects.my_card_cont.sx]},true,0.4,'linear');
		anim2.add(objects.opp_card_cont,{x:[900, objects.opp_card_cont.sx]},true,0.4,'linear');
		anim2.add(objects.my_eaten_cont,{alpha:[0, 1]},true,0.4,'linear');
		anim2.add(objects.opp_eaten_cont,{alpha:[0, 1]},true,0.4,'linear');
		
		//включаем взаимодейтсвие с доской
		objects.board.pointerdown=board.mouse_down.bind(board);
		
		if (role === 'master')
			g_board = [['r','n','b','q','k','b','n','r'],['p','p','p','p','p','p','p','p'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['P','P','P','P','P','P','P','P'],['R','N','B','Q','K','B','N','R']];
		else
			g_board = [['r','n','b','k','q','b','n','r'],['p','p','p','p','p','p','p','p'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['x','x','x','x','x','x','x','x'],['P','P','P','P','P','P','P','P'],['R','N','B','K','Q','B','N','R']];

		board_func.update_board();
		
	},
	
	init_quiz(){
		
		my_turn=this.is_my_first_move=true;
		
		this.move_flags=[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];

		//определяем цвет фигур
		this.my_color='w';
		this.op_color='b';
				
		//никакая фигура не быбрана
		this.selected_piece=0;		
		
		//предыдущее состояние доски
		this.prv_state={};
		
		//общие элементы для игры		
		objects.selected_frame.visible=false;
		objects.cur_move_text.visible=true;
		anim2.add(objects.board,{alpha:[0, 1]},true,0.4,'linear');
		anim2.add(objects.my_card_cont,{x:[-100, objects.my_card_cont.sx]},true,0.4,'linear');
		//anim2.add(objects.opp_card_cont,{x:[900, objects.opp_card_cont.sx]},true,0.4,'linear');
		
		//включаем взаимодейтсвие с доской
		objects.board.pointerdown=board.mouse_down.bind(board);
		
		board_func.update_board();
		
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
		
		const _is_check = board_func.is_check(_new_board, 'K');
		if (_is_check === true) {
			message.add(['Рокировка невозможна. Битое поле на пути короля.','Castling is impossible. The field is under attack.'][LANG]);
			return 'beaten_field';
		}			

		return 'ok_castling';
	},
		
	async mouse_down(e) {

		if (objects.big_message_cont.visible === true || objects.pawn_replace_dialog.visible === true || objects.req_cont.visible === true || this.checker_is_moving === 1)	{
			sound.play('locked');
			return
		}

		
		//координаты указателя
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;

		//координаты указателя на игровой доске
		let new_x=Math.floor(8*(mx-objects.board.x-20)/400);
		let new_y=Math.floor(8*(my-objects.board.y-10)/400);

		//если фигура еще не выбрана
		if (this.selected_piece===0){
			this.valid_moves = [];
			
			//проверяем что выбрана моя фигура а не оппонента или пустая клетка
			let piece = g_board[new_y][new_x];
			if (my_pieces.includes(piece) === false) {
				return;			
			}			
						
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
		if (this.selected_piece!==0){
			
			//если нажали на выделенную шашку то отменяем выделение
			if (new_x===this.selected_piece.ix && new_y===this.selected_piece.iy){
				sound.play('move');
				this.selected_piece=0;
				objects.selected_frame.visible=false;
				return;
			}						
			
			//если игрок хочет рокировку, проверяем....			
			let castling = this.is_castling(this.selected_piece,new_x,new_y);
			if (['incorrect_castling','rook_moved','king_moved','player_under_check','field_not_free','beaten_field'].includes(castling))
				return;
			
			//проверяем если это валидный ход и это не рокировка
			if (this.valid_moves.includes(new_x+'_'+new_y) === false && castling === 'no_castling') {	
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
			
			let is_check = board_func.is_check(new_board, 'K');
			if (is_check === true) {
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
		return null;		
	},
	
	get_pass_eaten_pawn_y(move_data){		
		const {x1,y1,x2,y2}=move_data;		
		if (g_board[y1][x1] === 'P'&&x1 !== x2 && g_board[y2][x2] === 'x')
			return 3;		
		if (g_board[y1][x1] === 'p'&&x1 !== x2 && g_board[y2][x2] === 'x')
			return 4;
		return null;		
	},
		
	async process_my_move(move_data, castling){

		const {x1,y1,x2,y2}=move_data;
		
		//запоминаем состояние доски до хода чтобы вернуть если надо
		this.prv_state.board=JSON.parse(JSON.stringify(g_board));		
		this.prv_state.move_flags=JSON.parse(JSON.stringify(this.move_flags));
		this.prv_state.eaten_labels={};
		for(const key in this.eaten_labels) this.prv_state.eaten_labels[key]=this.eaten_labels[key].val;
		
		//заносим информацию о сделаных ходах (для расчета рокировки)
		this.move_flags[y1][x1]=1;
		
		//звук перемещения
		sound.play('move');		
		
		this.me_conf_play=true;
		
		//запоминаем какая фигура пошла
		const figure_to_move=g_board[y1][x1];
								
		//анимационное перемещение
		if(castling){
			
			//анимационное перемещение
			await this.make_castling_on_board(move_data)
			
		}else{			
			
			//определяем пешку на проходе
			const pass_taken_pawn_pos_y = this.get_pass_eaten_pawn_y(move_data);
				
			//определяем съеденую фигуру
			const eaten_figure=this.get_eaten_piece(pass_taken_pawn_pos_y,x2,y2);
			var eaten_figure_s=eaten_figure?.piece;
			
			//анимационное перемещение
			await this.make_move_on_board(move_data,eaten_figure)
			
			//перенос фигуры в массиве
			g_board[y2][x2] = g_board[y1][x1];
			g_board[y1][x1] = 'x'	
			
			//удаления взятой на проходе пешки в массиве
			if (pass_taken_pawn_pos_y) g_board[pass_taken_pawn_pos_y][x2] = 'x';
			
			//диалог выбора фигуры и замена пешки
			if (g_board[y2][x2] === 'P' && y2 === 0) {
				g_board[y2][x2] = await pawn_replace_dialog.show();		
				move_data.pawn_replace = g_board[y2][x2].toLowerCase();	
			}				
		}
		
		//обновляем доску
		board_func.update_board();
		
		//отпрравляем ход оппоненту
		opponent.send_move(move_data);	
				
		//проверяем звершение игры
		const final_state = board_func.check_fin(g_board,'b');		
					
		if (final_state === 'check')
			message.add(['Вы объявили шах!','You have declared a check!'][LANG]);	
		
		//сообщаем в цикл что ход завершен
		my_player.move_resolver([final_state+ '_to_opponent',figure_to_move,eaten_figure_s]);

	},
		
	async make_move_on_board (move_data,eaten_figure) {
				
		if (state === 'o')
			return;
			
		let {x1,y1,x2,y2} = move_data;
				
		//медленно убираем съеденную фигуру если она имеется		
		if (eaten_figure){
			sound.play('eaten');
			anim2.add(eaten_figure,{alpha:[1,0]}, false, 0.06,'linear');			
		}

						
		//подготавливаем данные для перестановки
		let piece=board_func.get_checker_by_pos(move_data.x1,move_data.y1);
		
		let x1p=move_data.x1*50+objects.board.x+20;
		let y1p=move_data.y1*50+objects.board.y+10;
		let x2p=move_data.x2*50+objects.board.x+20;
		let y2p=move_data.y2*50+objects.board.y+10;
		
		await anim2.add(piece,{x:[x1p,x2p],y:[y1p,y2p]}, true, 0.25,'easeInOutCubic');
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
		let king_y1p = y*50 + objects.board.y+10;		
		let king_x2p = king_x2*50 + objects.board.x+20;
		let king_y2p = y*50 + objects.board.y+10;
		
		let rook_x1p = rook_x1*50 + objects.board.x+20;
		let rook_y1p = y*50 + objects.board.y+10;		
		let rook_x2p = rook_x2*50 + objects.board.x+20;
		let rook_y2p = y*50 + objects.board.y+10;
		
		await Promise.all([anim2.add(king_fig,{x:[king_x1p,king_x2p]}, true, 0.3,'easeInOutCubic'), anim2.add(rook_fig,{x:[rook_x1p,rook_x2p]}, true, 0.3,'easeInOutCubic')]);
		
		//обновляем массив
		g_board[y][rook_x2] = g_board[y][rook_x1] ;
		g_board[y][king_x2] = g_board[y][king_x1] ;
		g_board[y][rook_x1] = 'x';		
		g_board[y][king_x1] = 'x';	

	},
	
	async process_op_move (move_data) {
		
		const {x1,y1,x2,y2} = move_data;		
		
		//проверка ошибок
		try {
			if (my_pieces.includes(g_board[y1][x1]) === true) {			
				firebase.database().ref("errors").push([my_data.name, opp_data.name, g_board, move_data, move]);
			}			
		} catch (e) {}
		
		//заносим информацию о сделаных ходах (для расчета рокировки)
		this.move_flags[y1][x1]=1;
		
		//воспроизводим уведомление о том что соперник произвел ход
		sound.play('receive_move');
		
		this.op_conf_play=true;
		
		//запоминаем какая фигура пошла
		const figure_to_move=g_board[y1][x1];
		
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
			
			//определяем пешку на проходе
			const pass_taken_pawn_pos_y = this.get_pass_eaten_pawn_y(move_data);
			
			//определяем съеденую фигуру
			const eaten_figure=this.get_eaten_piece(pass_taken_pawn_pos_y,x2,y2);
			var eaten_figure_s=eaten_figure?.piece;
			
			//анимационное перемещение
			await this.make_move_on_board(move_data,eaten_figure);
			
			//перенос фигуры в массиве
			g_board[y2][x2] = g_board[y1][x1];
			g_board[y1][x1] = 'x'	
			
			//удаления взятой на проходе пешки в массиве
			if (pass_taken_pawn_pos_y) g_board[pass_taken_pawn_pos_y][x2] = 'x';
			
			//если производится бонусная замена пешки в массиве
			if (move_data.pawn_replace) g_board[y2][x2] = move_data.pawn_replace;	
									
		}
		
		//обновляем доску
		board_func.update_board();
		
		//проверяем завершение игры
		const final_state = board_func.check_fin(g_board,'w');	
		
		//поверяем если мне объявлен шах
		this.player_under_check = false
		if (final_state === 'check') {
			message.add(['Шах!','Check!'][LANG]);			
			this.player_under_check = true;			
		}
		
		return [final_state+'_to_player',figure_to_move,eaten_figure_s];
	},
	
}

my_player={
	
	move_resolver:0,
	timer:0,
	prv_time:null,
	time_for_move:0,
	conf_play_flag:false,
	
	activate_timer(){
			
		if(objects.timer.visible===false || opponent!==online_player) return;
		
		this.timer_start_time=Date.now();
		
		this.timer=setInterval(my_player.time_tick.bind(my_player),1000);	
		
		this.conf_play_flag
			? this.time_for_move=45
			: this.time_for_move=15
			
		objects.timer.text = '0:'+this.time_for_move;
		objects.timer.x=225;
		objects.timer.tint=0xffffff;	
		
		//это для проврки таймера
		this.prv_time=null;
		
	},
		
	async wait_move(){
				
		my_turn=true;
		objects.board.interactive=true;

		this.activate_timer();
				
		const response=await new Promise(resolver=>{			
			this.move_resolver=resolver;			
		})	
		
		objects.board.interactive=false;
		this.conf_play_flag=true;
		my_turn=false;
		clearTimeout(this.timer);	
		
		return response;
	},
	
	time_tick(){
		
		const cur_time=Date.now();
		const time_passed=~~((cur_time-this.timer_start_time)*0.001);
		const time_left=this.time_for_move-time_passed;
		
		
		if(this.prv_time){			
			const tick_time=cur_time-this.prv_time;
			if(tick_time>5000){
				this.move_resolver(['timer_error']);
				return;
			}
		}
		this.prv_time=cur_time;	
			
		
		
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
		
		//если время закончилось
		if(time_left<=-5){			
			this.conf_play_flag
				? this.move_resolver(['my_timeout'])
				: this.move_resolver(['my_no_sync']);
		}
		
	}
	
}

game={

	activate: function(role, op) {
		
		my_role=role;
		opponent = op;
					
		//если открыт лидерборд то закрываем его
		if (objects.lb_1_cont.visible===true) lb.close();		
		
		if(op===quiz)
			this.run_quiz();
		else
			this.run_game();

	},
				
	async run_game(){
		
		let move=0;
		let players;
		
		//выбираем порядок ходов
		my_role==='master'
		? players=[my_player,opponent]
		: players=[opponent,my_player];

		//инициируем доску
		board.init(my_role);

		let response=''
		let draw_50=0;
		
		//главный цикл игры
		game_loop:while(true){
			
			//считаем ходы без взятия и движения пешек
			draw_50++;			
			objects.cur_move_text.text=['Ход: ','Move: '][LANG]+move;
			//2 хода
			for (let i=0;i<2;i++){
				
				response=await players[i].wait_move();
				//console.log(response)
				if(['checkmate_to_player',
					'checkmate_to_opponent',
					'stalemate_to_player',
					'draw',
					'op_timeout',
					'op_no_sync',
					'my_timeout',
					'timer_error',
					'my_no_sync',
					'op_gave_up',
					'player_gave_up',
					'stalemate_to_opponent',
					'stop'].includes(response[0])) break game_loop;	

				//сбрасываем счетчик
				if(response[1]==='P'||response[1]==='p'||response[2]) draw_50=0;
					
				//если кого-то съели то обновляем данную информацию
				if(response[2]) {				
					const e=board.eaten_labels[response[2]];
					e.text=++e.val;				
				}
					
			}			
			
			if(draw_50===50){
				response[0]='draw_50';
				break game_loop;				
			}		
			
			if([30,35,40,45,46,47,48,49].includes(draw_50))
				message.add([`Ходов до ничьи: ${50-draw_50}. Если не будет взятий или движения пешек.`,`Moves to a draw: ${50-draw_50}. If there are no takeaways or pawn movements.`][LANG])
					
			
			move++;			
		}
		
		
		console.log('Вышли из цикла с результатом: ',response)
		
		opponent.stop(response[0]);
		
	},
			
	async run_quiz(){

		let move=0;
		
		players=[my_player,opponent];
		
		//инициируем доску
		board.init_quiz();
		
		//главный цикл игры
		game_loop:while(true){
						
			//2 хода
			objects.cur_move_text.text=['Ход: ','Move: '][LANG]+move;
			
			for (let i=0;i<2;i++){
				
				response=await players[i].wait_move();
				//console.log(response)
				if(['checkmate_to_player',
					'checkmate_to_opponent',
					'stalemate_to_player',
					'draw',
					'op_timeout',
					'op_no_sync',
					'my_timeout',
					'timer_error',
					'my_no_sync',
					'op_gave_up',
					'player_gave_up',
					'stalemate_to_opponent',
					'stop'].includes(response[0])) break game_loop;	

			}
			
			
			move++;	

			if(move===quiz.moves_to_mate){
				response[0]='draw_50';
				break game_loop;				
			}	
			
		}
		
		console.log('Вышли из цикла с результатом: ',response)
		
		opponent.stop(response[0]);
	},		
			
	play_finish_sound : function(result) {
		
		if (result === LOSE )
			sound.play('lose');
		if (result === WIN )
			sound.play('win');
		if (result === DRAW || result === NOSYNC)
			sound.play('draw');
		
	},
		
	clear_elements:function(){
		
		//общие элементы для игры
		objects.timer.visible=false;
		objects.board.visible=false;
		objects.stickers_cont.visible=false;
		objects.cur_move_text.visible=false;
		objects.opp_card_cont.visible=false;
		objects.my_card_cont.visible=false;
		objects.my_eaten_cont.visible=false;
		objects.opp_eaten_cont.visible=false;	
		objects.selected_frame.visible=false;		
		objects.pawn_replace_dialog.visible=false;		
		objects.mini_dialog.visible=false;	
		objects.figures.forEach((c)=>{	c.visible = false});	
		message.close();
		
	},
		
	stop : async function () {
				
		this.clear_elements();
				
		opp_data.uid = '';
				
		ad.show();
		
		main_menu.activate();
		
		//устанавливаем статус в базе данных а если мы не видны то установливаем только скрытое состояние
		set_state({state : 'o'});		
		
	}

}

feedback = {
		
	rus_keys : [[50,176,80,215.07,'1'],[90,176,120,215.07,'2'],[130,176,160,215.07,'3'],[170,176,200,215.07,'4'],[210,176,240,215.07,'5'],[250,176,280,215.07,'6'],[290,176,320,215.07,'7'],[330,176,360,215.07,'8'],[370,176,400,215.07,'9'],[410,176,440,215.07,'0'],[491,176,541,215.07,'<'],[70,224.9,100,263.97,'Й'],[110,224.9,140,263.97,'Ц'],[150,224.9,180,263.97,'У'],[190,224.9,220,263.97,'К'],[230,224.9,260,263.97,'Е'],[270,224.9,300,263.97,'Н'],[310,224.9,340,263.97,'Г'],[350,224.9,380,263.97,'Ш'],[390,224.9,420,263.97,'Щ'],[430,224.9,460,263.97,'З'],[470,224.9,500,263.97,'Х'],[510,224.9,540,263.97,'Ъ'],[90,273.7,120,312.77,'Ф'],[130,273.7,160,312.77,'Ы'],[170,273.7,200,312.77,'В'],[210,273.7,240,312.77,'А'],[250,273.7,280,312.77,'П'],[290,273.7,320,312.77,'Р'],[330,273.7,360,312.77,'О'],[370,273.7,400,312.77,'Л'],[410,273.7,440,312.77,'Д'],[450,273.7,480,312.77,'Ж'],[490,273.7,520,312.77,'Э'],[70,322.6,100,361.67,'!'],[110,322.6,140,361.67,'Я'],[150,322.6,180,361.67,'Ч'],[190,322.6,220,361.67,'С'],[230,322.6,260,361.67,'М'],[270,322.6,300,361.67,'И'],[310,322.6,340,361.67,'Т'],[350,322.6,380,361.67,'Ь'],[390,322.6,420,361.67,'Б'],[430,322.6,460,361.67,'Ю'],[511,322.6,541,361.67,')'],[451,176,481,215.07,'?'],[30,371.4,180,410.47,'ЗАКРЫТЬ'],[190,371.4,420,410.47,'_'],[430,371.4,570,410.47,'ОТПРАВИТЬ'],[531,273.7,561,312.77,','],[471,322.6,501,361.67,'('],[30,273.7,80,312.77,'EN']],	
	eng_keys : [[50,176,80,215.07,'1'],[90,176,120,215.07,'2'],[130,176,160,215.07,'3'],[170,176,200,215.07,'4'],[210,176,240,215.07,'5'],[250,176,280,215.07,'6'],[290,176,320,215.07,'7'],[330,176,360,215.07,'8'],[370,176,400,215.07,'9'],[410,176,440,215.07,'0'],[491,176,541,215.07,'<'],[110,224.9,140,263.97,'Q'],[150,224.9,180,263.97,'W'],[190,224.9,220,263.97,'E'],[230,224.9,260,263.97,'R'],[270,224.9,300,263.97,'T'],[310,224.9,340,263.97,'Y'],[350,224.9,380,263.97,'U'],[390,224.9,420,263.97,'I'],[430,224.9,460,263.97,'O'],[470,224.9,500,263.97,'P'],[130,273.7,160,312.77,'A'],[170,273.7,200,312.77,'S'],[210,273.7,240,312.77,'D'],[250,273.7,280,312.77,'F'],[290,273.7,320,312.77,'G'],[330,273.7,360,312.77,'H'],[370,273.7,400,312.77,'J'],[410,273.7,440,312.77,'K'],[450,273.7,480,312.77,'L'],[471,322.6,501,361.67,'('],[70,322.6,100,361.67,'!'],[150,322.6,180,361.67,'Z'],[190,322.6,220,361.67,'X'],[230,322.6,260,361.67,'C'],[270,322.6,300,361.67,'V'],[310,322.6,340,361.67,'B'],[350,322.6,380,361.67,'N'],[390,322.6,420,361.67,'M'],[511,322.6,541,361.67,')'],[451,176,481,215.07,'?'],[30,371.4,180,410.47,'CLOSE'],[190,371.4,420,410.47,'_'],[430,371.4,570,410.47,'SEND'],[531,273.7,561,312.77,','],[30,273.7,80,312.77,'RU']],
	keyboard_layout : [],
	lang : '',
	p_resolve : 0,
	MAX_SYMBOLS : 50,
	uid:0,
	
	show : function(uid) {
		
		this.set_keyboard_layout(['RU','EN'][LANG]);				
		this.uid = uid;
		objects.feedback_msg.text ='';
		objects.feedback_control.text = `0/${this.MAX_SYMBOLS}`
				
		anim2.add(objects.feedback_cont,{y:[-400, objects.feedback_cont.sy]}, true, 0.4,'easeOutBack');	
		return new Promise(function(resolve, reject){					
			feedback.p_resolve = resolve;	  		  
		});
		
	},
	
	set_keyboard_layout(lang) {
		
		this.lang = lang;
		
		if (lang === 'RU') {
			this.keyboard_layout = this.rus_keys;
			objects.feedback_bcg.texture = gres.feedback_bcg_rus.texture;
		} 
		
		if (lang === 'EN') {
			this.keyboard_layout = this.eng_keys;
			objects.feedback_bcg.texture = gres.feedback_bcg_eng.texture;
		}
		
	},
	
	close : function() {
			
		anim2.add(objects.feedback_cont,{y:[objects.feedback_cont.y,450]}, false, 0.4,'easeInBack');		
		
	},
	
	get_texture_for_key (key) {
		
		if (key === '<' || key === 'EN' || key === 'RU') return gres.hl_key1.texture;
		if (key === 'ЗАКРЫТЬ' || key === 'ОТПРАВИТЬ' || key === 'SEND' || key === 'CLOSE') return gres.hl_key2.texture;
		if (key === '_') return gres.hl_key3.texture;
		return gres.hl_key0.texture;
	},
	
	key_down : function(key) {
		
		
		if (objects.feedback_cont.visible === false || objects.feedback_cont.ready === false) return;
		
		key = key.toUpperCase();
		
		if (key === 'ESCAPE') key = {'RU':'ЗАКРЫТЬ','EN':'CLOSE'}[this.lang];			
		if (key === 'ENTER') key = {'RU':'ОТПРАВИТЬ','EN':'SEND'}[this.lang];	
		if (key === 'BACKSPACE') key = '<';
		if (key === ' ') key = '_';
			
		var result = this.keyboard_layout.find(k => {
			return k[4] === key
		})
		
		if (result === undefined) return;
		this.pointerdown(null,result)
		
	},
	
	pointerdown : function(e, inp_key) {
		
		let key = -1;
		let key_x = 0;
		let key_y = 0;		
		
		if (e !== null) {
			
			let mx = e.data.global.x/app.stage.scale.x - objects.feedback_cont.x;
			let my = e.data.global.y/app.stage.scale.y - objects.feedback_cont.y;;

			let margin = 5;
			for (let k of this.keyboard_layout) {			
				if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin) {
					key = k[4];
					key_x = k[0];
					key_y = k[1];
					break;
				}
			}			
			
		} else {
			
			key = inp_key[4];
			key_x = inp_key[0];
			key_y = inp_key[1];			
		}
		
		
		
		//не нажата кнопка
		if (key === -1) return;			
				
		//подсвечиваем клавишу
		objects.hl_key.x = key_x - 10;
		objects.hl_key.y = key_y - 10;		
		objects.hl_key.texture = this.get_texture_for_key(key);
		anim2.add(objects.hl_key,{alpha:[1, 0]}, false, 0.5,'linear');
						
		if (key === '<') {
			objects.feedback_msg.text=objects.feedback_msg.text.slice(0, -1);
			key ='';
		}			
		
		
		if (key === 'EN' || key === 'RU') {
			this.set_keyboard_layout(key)
			return;	
		}	
		
		if (key === 'ЗАКРЫТЬ' || key === 'CLOSE') {
			this.close();
			this.p_resolve(['close','']);	
			key ='';
			sound.play('keypress');
			return;	
		}	
		
		if (key === 'ОТПРАВИТЬ' || key === 'SEND') {
			
			if (objects.feedback_msg.text === '') return;
			
			//если нашли ненормативную лексику то закрываем
			let mats =/шлю[хш]|п[еи]д[аеор]|суч?ка|г[ао]ндо|х[ую][ейяе]л?|жоп|соси|дроч|чмо|говн|дерьм|трах|секс|сосат|выеб|пизд|срал|уеб[аико]щ?|ебень?|ебу[ч]|ху[йия]|еба[нл]|дроч|еба[тш]|педик|[ъы]еба|ебну|ебл[аои]|ебись|сра[кч]|манда|еб[лн]я|ублюд|пис[юя]/i;
			let text_no_spaces = objects.feedback_msg.text.replace(/ /g,'');
			if (text_no_spaces.match(mats)) {
				this.close();
				this.p_resolve(['close','']);	
				key ='';
				return;
			}
			
			this.close();
			this.p_resolve(['sent',objects.feedback_msg.text]);	
			key ='';
			sound.play('keypress');
			return;	
		}	
		
		
		
		if (objects.feedback_msg.text.length >= this.MAX_SYMBOLS)  {
			sound.play('locked');
			return;			
		}
		
		if (key === '_') {
			objects.feedback_msg.text += ' ';	
			key ='';
		}			
		

		sound.play('keypress');
		
		objects.feedback_msg.text += key;	
		objects.feedback_control.text = `${objects.feedback_msg.text.length}/${this.MAX_SYMBOLS}`		
		
	}
	
}

keep_alive= function() {
	
	if (h_state === 1) {		
		
		//убираем из списка если прошло время с момента перехода в скрытое состояние		
		let cur_ts = Date.now();	
		let sec_passed = (cur_ts - hidden_state_start)/1000;		
		if ( sec_passed > 70 )	firebase.database().ref(room_name +"/"+my_data.uid).remove();
		return;		
	}


	firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
	firebase.database().ref("inbox/"+my_data.uid).onDisconnect().remove();
	firebase.database().ref(room_name+"/"+my_data.uid).onDisconnect().remove();
	set_state({});
}

process_new_message=function(msg) {

	//проверяем плохие сообщения
	if (msg===null || msg===undefined)
		return;

	//принимаем только положительный ответ от соответствующего соперника и начинаем игру
	if (msg.message==="ACCEPT"  && pending_player===msg.sender && state !== "p") {
		//в данном случае я мастер и хожу вторым
		game_id=msg.game_id;
		cards_menu.accepted_invite();
	}

	//принимаем также отрицательный ответ от соответствующего соперника
	if (pending_player===msg.sender) {
		
		if (msg.message==="REJECT")
			cards_menu.rejected_invite('Соперник отказался от игры!');
		if (msg.message==="REJECT_ALL")
			cards_menu.rejected_invite('Соперник пока не принимает приглашения!');
		
		
	}

	//получение сообщение в состояни игры
	if (state==="p") {

		//учитываем только сообщения от соперника
		if (msg.sender===opp_data.uid) {

			//получение отказа от игры
			if (msg.message==="REFUSE")
				confirm_dialog.opponent_confirm_play(0);

			//получение согласия на игру
			if (msg.message==="CONF")
				confirm_dialog.opponent_confirm_play(1);

			//получение стикера
			if (msg.message==="MSG")
				stickers.receive(msg.data);

			//получение сообщение с сдаче
			if (msg.message==="GIVEUP" )
				online_player.opp_giveup();
				
			//запрос на ничью
			if (msg.message==="DRAWREQ" )
				mini_dialog.show('draw_request');
				
			//соперник согласился на ничью
			if (msg.message==="DRAWOK" )
				online_player.draw();
						
			//у соперника нет времения
			if (msg.message==="TIME" )
				online_player.resolver(['op_timeout']);
				
			//отказ от ничьи
			if (msg.message==="DRAWNO" )
				message.add(['Соперник отказался от ничьи','The opponent refused to draw'][LANG]);
				
			//получение сообщение с ходом игорка
			if (msg.message==="MOVE")
				online_player.move_resolver(msg.data);
		}
	}

	//приглашение поиграть
	if(state==="o" || state==="b") {
					
		
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

req_dialog = {
	
	_opp_data : {} ,
	
	show(uid) {		
	
	
		if (state === 'b' && no_invite) {
			
			firebase.database().ref("inbox/"+uid).set({sender:my_data.uid,message:"REJECT_ALL",tm:Date.now()});
			return;
		}
	
		firebase.database().ref("players/"+uid).once('value').then((snapshot) => {

			//не показываем диалог если мы в игре
			if (state === 'p')
				return;

			player_data=snapshot.val();

			//показываем окно запроса только если получили данные с файербейс
			if (player_data===null) {
				//console.log("Не получилось загрузить данные о сопернике");
			}	else	{

				//так как успешно получили данные о сопернике то показываем окно
				sound.play('receive_sticker');
				anim2.add(objects.req_cont,{y:[-200, objects.req_cont.sy]},true,0.5,'easeOutElastic');

				//Отображаем  имя и фамилию в окне приглашения
				req_dialog._opp_data.name = player_data.name;
				make_text(objects.req_name,player_data.name,200);
				objects.req_rating.text = player_data.rating;
				req_dialog._opp_data.rating = player_data.rating;

				//throw "cut_string erroor";
				req_dialog._opp_data.uid=uid;
				
				//загружаем фото
				this.load_photo(player_data.pic_url);

			}
		});
	},

	load_photo: function(pic_url) {


		//сначала смотрим на загруженные аватарки в кэше
		if (PIXI.utils.TextureCache[pic_url]===undefined || PIXI.utils.TextureCache[pic_url].width===1) {

			//console.log("Загружаем текстуру "+objects.mini_cards[id].name)
			var loader = new PIXI.Loader();
			loader.add("inv_avatar", pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});
			loader.load((loader, resources) => {
				objects.req_avatar.texture=loader.resources.inv_avatar.texture;
			});
		}
		else
		{
			//загружаем текустуру из кэша
			//console.log("Ставим из кэша "+objects.mini_cards[id].name)
			objects.req_avatar.texture=PIXI.utils.TextureCache[pic_url];
		}

	},

	reject: function() {

		if (objects.req_cont.ready===false){
			sound.play('locked')
			return;				
		}
		
		sound.play('click');
		
		anim2.add(objects.req_cont,{y:[objects.req_cont.y, -260]},false,0.4,'easeInBack');
		firebase.database().ref("inbox/"+req_dialog._opp_data.uid).set({sender:my_data.uid,message:"REJECT",tm:Date.now()});
	},
	
	reject_all_game: function() {

		if (objects.req_cont.ready===false){
			sound.play('locked')
			return;				
		}
	
		message.add(['Приглашения отключены','Invitations are disabled'][LANG]);
		no_invite = true;
		
		sound.play('click');
		
		anim2.add(objects.req_cont,{y:[objects.req_cont.y, -260]},false,0.4,'easeInBack');
		
		//удаляем из комнаты
		firebase.database().ref(room_name + "/" + my_data.uid).remove();
		firebase.database().ref("inbox/"+req_dialog._opp_data.uid).set({sender:my_data.uid,message:"REJECT_ALL",tm:Date.now()});
	},

	accept: function() {

		if (anim2.any_on()===true || objects.big_message_cont.visible === true || objects.feedback_cont.visible === true || objects.pawn_replace_dialog.visible === true) {
			sound.play('locked');
			return;			
		}


		any_dialog_active=0;
		
		//устанавливаем окончательные данные оппонента
		opp_data=req_dialog._opp_data;


		anim2.add(objects.req_cont,{y:[objects.req_cont.y, -260]},false,0.4,'easeInBack');

		//отправляем информацию о согласии играть с идентификатором игры
		game_id=~~(Math.random()*599);
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"ACCEPT",tm:Date.now(),game_id:game_id});

		//заполняем карточку оппонента
		make_text(objects.opp_card_name,opp_data.name,150);
		objects.opp_card_rating.text=objects.req_rating.text;
		objects.opp_avatar.texture=objects.req_avatar.texture;

		main_menu.close();
		cards_menu.close();
		online_player.activate("slave");

	},

	hide: function() {

		//если диалог не открыт то ничего не делаем
		if (objects.req_cont.ready===false || objects.req_cont.visible===false)
			return;

		anim2.add(objects.req_cont,{y:[objects.req_cont.y, -260]},false,0.4,'easeInBack');
	}

}

ad = {
	
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

social_dialog = {
	
	show : function() {
		
		anim2.add(objects.social_cont,{x:[800,objects.social_cont.sx]}, true, 0.06,'linear');
		
		
	},
	
	invite_down : function() {
		
		if (objects.social_cont.ready !== true)
			return;
		
		sound.play('click');
		vkBridge.send('VKWebAppShowInviteBox');
		social_dialog.close();
		
	},
	
	share_down: function() {
		
		if (objects.social_cont.ready !== true)
			return;
		
		sound.play('click');
		vkBridge.send('VKWebAppShowWallPostBox', {"message": `Мой рейтинг в игре шахматы-блиц ${my_data.rating}. Сможешь победить меня?`,
		"attachments": "https://vk.com/app7991685"});
		social_dialog.close();
	},
	
	close_down: function() {
		if (objects.social_cont.ready !== true)
			return;
		
		sound.play('click');
		social_dialog.close();
	},
	
	close : function() {
		
		anim2.add(objects.social_cont,{x:[objects.social_cont.x,800]}, false, 0.06,'linear');
				
	}
	
}

main_menu= {

	activate: async function() {
		
		//игровой титл
		anim2.add(objects.game_title,{y:[-100,objects.game_title.sy],alpha:[0,1]}, true, 0.75,'linear');	
		
		//кнопки
		await anim2.add(objects.main_buttons_cont,{y:[450,objects.main_buttons_cont.sy],alpha:[0,1]}, true, 0.75,'linear');	
		
		objects.desktop.texture=gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.5,'linear');	

	},

	close : async function() {
		
		anim2.add(objects.game_title,{y:[objects.game_title.y,-100],alpha:[1,0]}, false, 0.5,'linear');	
		anim2.add(objects.main_buttons_cont,{y:[objects.main_buttons_cont.y,450],alpha:[1,0]}, false, 0.5,'linear');	
		await anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.52,'linear');	
		
	},

	play_button_down: async function () {

		if(anim2.any_on()===true){
			sound.play('locked');
			return;
		}

		sound.play('click');

		await this.close();
		cards_menu.activate();

	},

	lb_button_down: async function () {

		if(anim2.any_on()===true){
			sound.play('locked');
			return;
		}

		sound.play('click');

		await this.close();
		lb.show();

	},

	rules_button_down: function () {

		if(anim2.any_on()===true){
			sound.play('locked');
			return;
		}

		sound.play('click');

		anim2.add(objects.rules_cont,{y:[-450, objects.rules_cont.sy]},true,0.4,'easeOutBack');

	},

	rules_ok_down: function () {
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

	mk_button_down: async function(){
		
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

	show: function() {

		objects.desktop.visible=true;
		objects.desktop.texture=game_res.resources.lb_bcg.texture;

		anim2.add(objects.lb_1_cont,{x:[-150,objects.lb_1_cont.sx]},true,0.4,'easeOutBack');
		anim2.add(objects.lb_2_cont,{x:[-150,objects.lb_2_cont.sx]},true,0.45,'easeOutBack');
		anim2.add(objects.lb_3_cont,{x:[-150,objects.lb_3_cont.sx]},true,0.5,'easeOutBack');
		anim2.add(objects.lb_cards_cont,{x:[450,0]},true,0.5,'easeOutCubic');
		
		

		objects.lb_cards_cont.visible=true;
		objects.lb_back_button.visible=true;

		for (let i=0;i<7;i++) {
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];
			objects.lb_cards[i].place.text=(i+4)+".";

		}


		this.update();

	},

	close: function() {


		objects.lb_1_cont.visible=false;
		objects.lb_2_cont.visible=false;
		objects.lb_3_cont.visible=false;
		objects.lb_cards_cont.visible=false;
		objects.lb_back_button.visible=false;

	},

	back_button_down: function() {

		if (any_dialog_active===1 || objects.lb_1_cont.ready===false) {
			sound.play('locked');
			return
		};


		sound.play('click');
		this.close();
		main_menu.activate();

	},

	update: function () {

		firebase.database().ref("players").orderByChild('rating').limitToLast(25).once('value').then((snapshot) => {

			if (snapshot.val()===null) {
			  //console.log("Что-то не получилось получить данные о рейтингах");
			}
			else {

				var players_array = [];
				snapshot.forEach(players_data=> {
					if (players_data.val().name!=="" && players_data.val().name!=='' && players_data.val().name!==undefined)
						players_array.push([players_data.val().name, players_data.val().rating, players_data.val().pic_url]);
				});


				players_array.sort(function(a, b) {	return b[1] - a[1];});

				//создаем загрузчик топа
				var loader = new PIXI.Loader();

				var len=Math.min(10,players_array.length);

				//загружаем тройку лучших
				for (let i=0;i<3;i++) {
					
					if (i >= len) break;		
					if (players_array[i][0] === undefined) break;	
					
					let fname = players_array[i][0];
					make_text(objects['lb_'+(i+1)+'_name'],fname,180);					
					objects['lb_'+(i+1)+'_rating'].text=players_array[i][1];
					loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 3000});
				};

				//загружаем остальных
				for (let i=3;i<10;i++) {
					
					if (i >= len) break;	
					if (players_array[i][0] === undefined) break;	
					
					let fname=players_array[i][0];

					make_text(objects.lb_cards[i-3].name,fname,180);

					objects.lb_cards[i-3].rating.text=players_array[i][1];
					loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});
				};

				loader.load();

				//показываем аватар как только он загрузился
				loader.onProgress.add((loader, resource) => {
					let lb_num=Number(resource.name.slice(-1));
					if (lb_num<3)
						objects['lb_'+(lb_num+1)+'_avatar'].texture=resource.texture
					else
						objects.lb_cards[lb_num-3].avatar.texture=resource.texture;
				});

			}

		});

	}

}

pawn_replace_dialog = {
		
	p_resolve : 0,
	
	show : async function () {
		
		sound.play('pawn_replace_dialog');
		let s = objects.pawn_replace_dialog;
		await anim2.add(s,{y:[-300,s.sy]}, true, 0.25,'easeOutBack');

		
		return new Promise(function(resolve, reject){					
			pawn_replace_dialog.p_resolve = resolve;	  		  
		});
	},
	
	close : async function () {
		
		let s = objects.pawn_replace_dialog;
		await anim2.add(s,{y:[s.y,-300]}, false, 0.25,'easeInBack');
		any_dialog_active = 0;			
	}, 
	
	down : function (figure) {
		
		if (anim2.any_on()===true || objects.big_message_cont.visible === true  || objects.req_cont.visible === true)	{
			sound.play('locked');
			return
		};
				
		this.close();
		sound.play('pawn_replace');
		this.p_resolve(figure);

	}
	
}

cards_menu={

	_opp_data : {},
	uid_pic_url_cache : {},
	room_name_num:'',
	
	cards_pos: [
				[0,0],[0,90],[0,180],[0,270],
				[190,0],[190,90],[190,180],[190,270],
				[380,0],[380,90],[380,180],[380,270],
				[570,0],[570,90],[570,180]

				],

	activate: function () {

		objects.cards_cont.visible=true;
		objects.back_button.visible=true;
		objects.cards_cont.alpha = 1;

		objects.desktop.visible=true;
		objects.desktop.texture=game_res.resources.cards_bcg.texture;

		//расставляем по соответствующим координатам
		for(let i=0;i<15;i++) {
			objects.mini_cards[i].x=this.cards_pos[i][0];
			objects.mini_cards[i].y=this.cards_pos[i][1];
		}


		//отключаем все карточки
		for(let i=0;i<15;i++)
			objects.mini_cards[i].visible=false;

		//включаем сколько игроков онлайн
		anim2.add(objects.players_online,{y:[500,objects.players_online.sy],x:[0,objects.players_online.sx]}, true, 0.6,'linear');		
		anim2.add(objects.cards_menu_title,{y:[-50,objects.cards_menu_title.sy],x:[0,objects.cards_menu_title.sx]}, true, 0.6,'linear');	
		
		//теперь уже можно приглашать
		no_invite=false;
		set_state({state : 'o'});
		
		//нормальное название комнаты
		this.room_name_num={'states':1,'states2':2,'states3':3,'states4':4,'states5':5}[room_name];
		
		//подписываемся на изменения состояний пользователей
		firebase.database().ref(room_name).on('value', (snapshot) => {cards_menu.players_list_updated(snapshot.val());});
		//firebase.database().ref(room_name + "/" + my_data.uid).set({state:state, name:my_data.name, rating : my_data.rating, hidden:h_state, opp_id : ''});

	},

	players_list_updated: function(players) {

		//если мы в игре то не обновляем карточки
		if (state==="p" || state==="b")
			return;


		//это столы
		let tables = {};
		
		//это свободные игроки
		let single = {};


		//делаем дополнительный объект с игроками и расширяем id соперника
		let p_data = JSON.parse(JSON.stringify(players));
		
		//создаем массив свободных игроков
		for (let uid in players){			
			if (players[uid].state !== 'p' && players[uid].hidden === 0)
				single[uid] = players[uid].name;						
		}
		
		//console.table(single);
		
		//убираем не играющие состояние
		for (let uid in p_data)
			if (p_data[uid].state !== 'p')
				delete p_data[uid];
		
		
		//дополняем полными ид оппонента
		for (let uid in p_data) {			
			let small_opp_id = p_data[uid].opp_id;			
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
		//console.log (`--------------------------------------------------`)
		for (let uid in p_data) {
			let opp_id = p_data[uid].opp_id;
			let name1 = p_data[uid].name;
			let rating = p_data[uid].rating;
			let hid = p_data[uid].hidden;
			
			if (p_data[opp_id] !== undefined) {
				
				if (uid === p_data[opp_id].opp_id && tables[uid] === undefined) {
					
					tables[uid] = opp_id;					
					//console.log(`${name1} (Hid:${hid}) (${rating}) vs ${p_data[opp_id].name} (Hid:${p_data[opp_id].hidden}) (${p_data[opp_id].rating}) `)	
					delete p_data[opp_id];				
				}
				
			} else 
			{				
				//console.log(`${name1} (${rating}) - одиночка `)					
			}			
		}
					
		
		
		//считаем и показываем количество онлайн игроков
		let num = 0;
		for (let uid in players)
			if (players[uid].hidden===0)
				num++

		objects.players_online.text=['Игроков онлайн: ','Players online: '][LANG] + num + ['     ( комната #','     ( room #'][LANG] + this.room_name_num +' )';
		
		
		//считаем сколько одиночных игроков и сколько столов
		let num_of_single = Object.keys(single).length;
		let num_of_tables = Object.keys(tables).length;
		let num_of_cards = num_of_single + num_of_tables;
		
		//если карточек слишком много то убираем столы
		if (num_of_cards > 15) {
			let num_of_tables_cut = num_of_tables - (num_of_cards - 15);			
			
			let num_of_tables_to_cut = num_of_tables - num_of_tables_cut;
			
			//удаляем столы которые не помещаются
			let t_keys = Object.keys(tables);
			for (let i = 0 ; i < num_of_tables_to_cut ; i++) {
				delete tables[t_keys[i]];
			}
		}
		
		//убираем карточки пропавших игроков и обновляем карточки оставшихся
		for(let i=0;i<15;i++) {			
			if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'single') {				
				let card_uid = objects.mini_cards[i].uid;				
				if (single[card_uid] === undefined)					
					objects.mini_cards[i].visible = false;
				else
					this.update_existing_card({id:i, state:players[card_uid].state , rating:players[card_uid].rating});
			}
		}
		
		//определяем новых игроков которых нужно добавить
		new_single = {};		
		
		for (let p in single) {
			
			let found = 0;
			for(let i=0;i<15;i++) {			
			
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
		for(let i=0;i<15;i++) {			
		
			if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'table') {
				
				let uid1 = objects.mini_cards[i].uid1;	
				let uid2 = objects.mini_cards[i].uid2;	
				
				let found = 0;
				
				for (let t in tables) {
					
					let t_uid1 = t;
					let t_uid2 = tables[t];				
					
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
			this.place_new_cart({uid:uid, state:players[uid].state, name : players[uid].name,  rating : players[uid].rating});

		//размещаем новые столы сколько свободно
		for (let uid in tables) {			
			let n1=players[uid].name
			let n2=players[tables[uid]].name
			
			let r1= players[uid].rating
			let r2= players[tables[uid]].rating
			this.place_table({uid1:uid,uid2:tables[uid],name1: n1, name2: n2, rating1: r1, rating2: r2});
		}
		
	},

	get_state_tint: function(s) {

		switch(s) {

			case "o":
				return 0x559955;
			break;

			case "b":
				return 0x376f37;
			break;

			case "p":
				return 0x344472;
			break;

			case "w":
				return 0x990000;
			break;
		}
	},

	place_table : function (params={uid1:0,uid2:0,name1: "XXX",name2: "XXX", rating1: 1400, rating2: 1400}) {
				
		for(let i=1;i<15;i++) {

			//это если есть вакантная карточка
			if (objects.mini_cards[i].visible===false) {

				//устанавливаем цвет карточки в зависимости от состояния
				objects.mini_cards[i].bcg.tint=this.get_state_tint(params.state);
				objects.mini_cards[i].state=params.state;

				objects.mini_cards[i].type = "table";
				
				
				objects.mini_cards[i].bcg.texture = gres.mini_player_card_table.texture;
				objects.mini_cards[i].bcg.tint=this.get_state_tint('p');
				
				//присваиваем карточке данные
				//objects.mini_cards[i].uid=params.uid;
				objects.mini_cards[i].uid1=params.uid1;
				objects.mini_cards[i].uid2=params.uid2;
												
				//убираем элементы свободного стола
				objects.mini_cards[i].rating_text.visible = false;
				objects.mini_cards[i].avatar.visible = false;
				objects.mini_cards[i].name_text.visible = false;

				//Включаем элементы стола 
				objects.mini_cards[i].rating_text1.visible = true;
				objects.mini_cards[i].rating_text2.visible = true;
				objects.mini_cards[i].avatar1.visible = true;
				objects.mini_cards[i].avatar2.visible = true;
				objects.mini_cards[i].rating_bcg.visible = true;

				objects.mini_cards[i].rating_text1.text = params.rating1;
				objects.mini_cards[i].rating_text2.text = params.rating2;
				
				objects.mini_cards[i].name1 = params.name1;
				objects.mini_cards[i].name2 = params.name2;

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid1, tar_obj:objects.mini_cards[i].avatar1});
				
				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid2, tar_obj:objects.mini_cards[i].avatar2});


				objects.mini_cards[i].visible=true;


				break;
			}
		}
		
	},

	update_existing_card: function(params={id:0, state:"o" , rating:1400}) {

		//устанавливаем цвет карточки в зависимости от состояния(имя и аватар не поменялись)
		objects.mini_cards[params.id].bcg.tint=this.get_state_tint(params.state);
		objects.mini_cards[params.id].state=params.state;

		objects.mini_cards[params.id].rating=params.rating;
		objects.mini_cards[params.id].rating_text.text=params.rating;
		objects.mini_cards[params.id].visible=true;
	},

	place_new_cart: function(params={uid:0, state: "o", name: "XXX", rating: rating}) {

		for(let i=0;i<15;i++) {

			//это если есть вакантная карточка
			if (objects.mini_cards[i].visible===false) {

				//устанавливаем цвет карточки в зависимости от состояния
				objects.mini_cards[i].bcg.texture = gres.mini_player_card.texture;
				objects.mini_cards[i].bcg.tint=this.get_state_tint(params.state);
				objects.mini_cards[i].state=params.state;

				objects.mini_cards[i].type = "single";

				//присваиваем карточке данные
				objects.mini_cards[i].uid=params.uid;

				//убираем элементы стола так как они не нужны
				objects.mini_cards[i].rating_text1.visible = false;
				objects.mini_cards[i].rating_text2.visible = false;
				objects.mini_cards[i].avatar1.visible = false;
				objects.mini_cards[i].avatar2.visible = false;
				objects.mini_cards[i].rating_bcg.visible = false;
				
				//включаем элементы свободного стола
				objects.mini_cards[i].rating_text.visible = true;
				objects.mini_cards[i].avatar.visible = true;
				objects.mini_cards[i].name_text.visible = true;

				objects.mini_cards[i].name=params.name;
				make_text(objects.mini_cards[i].name_text,params.name,110);
				objects.mini_cards[i].rating=params.rating;
				objects.mini_cards[i].rating_text.text=params.rating;

				objects.mini_cards[i].visible=true;

				//стираем старые данные
				objects.mini_cards[i].avatar.texture=PIXI.Texture.EMPTY;

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid, tar_obj:objects.mini_cards[i].avatar});

				//console.log(`новая карточка ${i} ${params.uid}`)
				break;
			}
		}

	},

	get_texture : function (pic_url) {
		
		return new Promise((resolve,reject)=>{
			
			//меняем адрес который невозможно загрузить
			if (pic_url==="https://vk.com/images/camera_100.png")
				pic_url = "https://i.ibb.co/fpZ8tg2/vk.jpg";

			//сначала смотрим на загруженные аватарки в кэше
			if (PIXI.utils.TextureCache[pic_url]===undefined || PIXI.utils.TextureCache[pic_url].width===1) {

				//загружаем аватарку игрока
				//console.log(`Загружаем url из интернети или кэша браузера ${pic_url}`)	
				let loader=new PIXI.Loader();
				loader.add("pic", pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});
				loader.load(function(l,r) {	resolve(l.resources.pic.texture)});
			}
			else
			{
				//загружаем текустуру из кэша
				//console.log(`Текстура взята из кэша ${pic_url}`)	
				resolve (PIXI.utils.TextureCache[pic_url]);
			}
		})
		
	},
	
	get_uid_pic_url : function (uid) {
		
		return new Promise((resolve,reject)=>{
						
			//проверяем есть ли у этого id назначенная pic_url
			if (this.uid_pic_url_cache[uid] !== undefined) {
				//console.log(`Взяли pic_url из кэша ${this.uid_pic_url_cache[uid]}`);
				resolve(this.uid_pic_url_cache[uid]);		
				return;
			}

							
			//получаем pic_url из фб
			firebase.database().ref("players/" + uid + "/pic_url").once('value').then((res) => {

				pic_url=res.val();
				
				if (pic_url === null) {
					
					//загрузить не получилось поэтому возвращаем случайную картинку
					resolve('https://avatars.dicebear.com/v2/male/'+irnd(10,10000)+'.svg');
				}
				else {
					
					//добавляем полученный pic_url в кэш
					//console.log(`Получили pic_url из ФБ ${pic_url}`)	
					this.uid_pic_url_cache[uid] = pic_url;
					resolve (pic_url);
				}
				
			});		
		})
		
	},
	
	load_avatar2 : function (params = {uid : 0, tar_obj : 0, card_id : 0}) {
		
		//получаем pic_url
		this.get_uid_pic_url(params.uid).then(pic_url => {
			return this.get_texture(pic_url);
		}).then(t=>{			
			params.tar_obj.texture=t;			
		})	
	},
	
	card_down : function ( card_id ) {
		
		if (objects.mini_cards[card_id].type === 'single')
			this.show_invite_dialog(card_id);
		
		if (objects.mini_cards[card_id].type === 'table')
			this.show_table_dialog(card_id);
				
	},
	
	show_table_dialog : function (card_id) {
		
		if (anim2.any_on()===true || objects.td_cont.visible === true || objects.big_message_cont.visible === true ||objects.req_cont.visible === true)	{
			sound.play('locked');
			return
		};


		sound.play('click');
		
		anim2.add(objects.td_cont,{y:[-150,objects.td_cont.sy]},true,0.4,'easeOutBack');

		
		objects.td_avatar1.texture = objects.mini_cards[card_id].avatar1.texture;
		objects.td_avatar2.texture = objects.mini_cards[card_id].avatar2.texture;
		
		objects.td_rating1.text = objects.mini_cards[card_id].rating_text1.text;
		objects.td_rating2.text = objects.mini_cards[card_id].rating_text2.text;
		
		make_text(objects.td_name1, objects.mini_cards[card_id].name1, 150);
		make_text(objects.td_name2, objects.mini_cards[card_id].name2, 150);
		
	},
		
	close_table_dialog : function () {
		
		if (objects.td_cont.ready === false)
			return;
		
		any_dialog_active--;	
		
		sound.play('close');
		
		anim2.add(objects.td_cont,{y:[objects.td_cont.y,400]},false,0.4,'easeInBack');

		
		
	},

	show_invite_dialog: function(cart_id) {


		if (anim2.any_on()===true || objects.invite_cont.visible === true || 	objects.big_message_cont.visible === true ||objects.req_cont.visible === true)	{
			sound.play('locked');
			return
		};


		objects.invite_feedback.text = '';

		pending_player="";

		sound.play('click');

		objects.invite_feedback.text = '';

		//затемняем основное 
		anim2.add(objects.cards_cont,{alpha:[1, 0.5]}, true, 0.15,'linear');

		//показыаем кнопку приглашения
		objects.invite_button.texture=gres.invite_button.texture;
	
		anim2.add(objects.invite_cont,{x:[800, objects.invite_cont.sx]}, true, 0.15,'linear');
		anim2.add(objects.cards_menu_title,{x:[objects.cards_menu_title.sx,230]}, true, 0.15,'linear');
		anim2.add(objects.players_online,{x:[objects.players_online.sx,230]}, true, 0.15,'linear');


		//копируем предварительные данные
		cards_menu._opp_data = {uid:objects.mini_cards[cart_id].uid,name:objects.mini_cards[cart_id].name,rating:objects.mini_cards[cart_id].rating};

		//затемняем кнопку если это не наша карточка
		objects.fb_my.alpha = 1;
		if (this._opp_data.uid !== my_data.uid)
			objects.fb_my.alpha = 0.2;	
		
		//флаг что это моя карточка
		let is_it_my_card = cards_menu._opp_data.uid === my_data.uid;
		
		//отображаем фидбэки
		this.show_feedbacks(cards_menu._opp_data.uid);

		let invite_available = 	cards_menu._opp_data.uid !== my_data.uid;
		invite_available=invite_available && (objects.mini_cards[cart_id].state==="o" || objects.mini_cards[cart_id].state==="b");
		invite_available=invite_available || cards_menu._opp_data.uid==="BOT";

		//показыаем кнопку приглашения только если это допустимо		
		if (invite_available === true) {			
			objects.invite_button_title.text = ['Пригласить','Invite'][LANG];			
			objects.invite_button.pointerdown = this.send_invite.bind(this);				
			
		} else {			

			objects.invite_button.pointerdown = function(){};			
			objects.invite_button_title.text = ['(((','((('][LANG];
		}
		
		//если это моя карточка то включаем возможность удаления комментариев
		//objects.fb_delete.visible = is_it_my_card

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=objects.invite_button_title.visible=invite_available;


		//заполняем карточу приглашения данными
		objects.invite_avatar.texture=objects.mini_cards[cart_id].avatar.texture;
		make_text(objects.invite_name,cards_menu._opp_data.name,230);
		objects.invite_rating.text=objects.mini_cards[cart_id].rating_text.text;

	},

	show_feedbacks: async function(uid) {
		
		//позвращаем текст на начальное положение
		objects.invite_feedback.text = '';
		objects.invite_feedback.y = objects.invite_feedback.sy;
		
		//получаем фидбэки
		let _fb = await firebase.database().ref("fb/" + uid).once('value');
		let fb_obj =_fb.val();
		if (fb_obj === null) {
			objects.invite_feedback.text = ['***нет отзывов***','***no feedbacks'][LANG]	
			return;
		}
		var fb = Object.keys(fb_obj).map((key) => [fb_obj[key][0],fb_obj[key][1],fb_obj[key][2]]);
		
		//выбираем последние отзывы
		fb.sort(function(a,b) {
			return a[1]-b[1]
		});		
		
		//очищаем фидбэки
		objects.invite_feedback.text ='';
		
		let fb_cnt = fb.length;
				
		for (let i = 0 ; i < fb_cnt;i++) {
			let sender_name =  fb[i][2] || 'Неизв.';
			if (sender_name.length > 10) sender_name = sender_name.substring(0, 10);			
			objects.invite_feedback.text +=(sender_name + ': ');
			objects.invite_feedback.text +=fb[i][0];
			objects.invite_feedback.text +='\n';	
		}
				
	},

	close: function() {


		if (objects.invite_cont.visible === true)
			this.hide_invite_dialog();
		
		if (objects.td_cont.visible === true)
			this.close_table_dialog();
		
		//добавляем основное
		anim2.add(objects.cards_cont,{alpha:[0.5, 0]}, false, 0.15,'linear');		
		objects.back_button.visible=false;
		objects.desktop.visible=false;

		//больше ни ждем ответ ни от кого
		pending_player="";

		//убираем сколько игроков онлайн
		anim2.add(objects.players_online,{y:[objects.players_online.y,500]}, false, 0.6,'linear');		
		anim2.add(objects.cards_menu_title,{y:[objects.cards_menu_title.y,-50]}, false, 0.6,'linear');	

		//подписываемся на изменения состояний пользователей
		firebase.database().ref(room_name).off();
		firebase.database().ref(room_name + "/" + my_data.uid).remove();
	},

	wheel_event: function(dir) {
		
		if (this.pover === 0) return;
		
		if (dir === 1)
			this.fb_down_down();
		else
			this.fb_up_down();
		
	},
	
	fb_up_down : function() {
		
		//если дошли до конца
		if (objects.invite_feedback.y - objects.invite_feedback.height  >=220)
			return;
		
		//отпускаем фидбэки ниже
		anim2.add(objects.invite_feedback,{y:[objects.invite_feedback.y, objects.invite_feedback.y+40]}, true, 0.25,'linear');
		
	},
	
	fb_down_down : function() {		

		
		//если дошли до конца
		if (objects.invite_feedback.y <=400)
			return;
		
		//поднимаем
		anim2.add(objects.invite_feedback,{y:[objects.invite_feedback.y, objects.invite_feedback.y-40]}, true, 0.25,'linear');
		
	},
	
	fb_my_down : async function() {		
		
		if (this._opp_data.uid !== my_data.uid || objects.feedback_cont.visible === true)
			return;
		
		let fb = await feedback.show(this._opp_data.uid);
		
		//перезагружаем отзывы если добавили один
		if (fb[0] === 'sent') {
			let fb_id = irnd(0,50);			
			await firebase.database().ref("fb/"+this._opp_data.uid+"/"+fb_id).set([fb[1], firebase.database.ServerValue.TIMESTAMP, my_data.name]);
			this.show_feedbacks(this._opp_data.uid);			
		}
		
	},
	
	fb_delete_down : async function() {		
		
		
		if (await confirm_dialog.show(['Удалить коменты?\nбудет показана реклама','Delete comments?'][LANG])==='no')
			return;
		
		let res = await ad.show2();
		if (res !== 'err') {			
			firebase.database().ref("fb/" + my_data.uid).remove();
			objects.invite_feedback.text = ['***нет отзывов***','***no feedbacks'][LANG]			
		}
		
	},

	hide_invite_dialog: function() {

		if (objects.invite_cont.ready === false)
			return;
		
		sound.play('close');
		
		//показываем осносной экран
		anim2.add(objects.cards_cont,{alpha:[0.5, 1]}, true, 0.15,'linear');

		//отправляем сообщение что мы уже не заинтересованы в игре
		if (pending_player!=="") {
			firebase.database().ref("inbox/"+pending_player).set({sender:my_data.uid,message:"INV_REM",tm:Date.now()});
			pending_player="";
		}

		//убираем инвайт контейнер и возвращаем хэдеры на свои места
		anim2.add(objects.invite_cont,{x:[objects.invite_cont.x, 800]}, false, 0.15,'linear');
		anim2.add(objects.cards_menu_title,{x:[230,objects.cards_menu_title.sx]}, true, 0.15,'linear');
		anim2.add(objects.players_online,{x:[230,objects.players_online.sx]}, true, 0.15,'linear');
		
	},

	send_invite: function() {


		if (anim2.any_on()===true || 	objects.big_message_cont.visible === true ||objects.req_cont.visible === true)	{
			sound.play('locked');
			return
		}


		sound.play('click');
		objects.invite_button_title.text = ['Ждите ответ...','Waiting...'][LANG];
		firebase.database().ref("inbox/"+cards_menu._opp_data.uid).set({sender:my_data.uid,message:"INV",tm:Date.now()});
		pending_player=cards_menu._opp_data.uid;


	},

	rejected_invite: function(rej_text) {

		pending_player="";
		cards_menu._opp_data={};
		this.hide_invite_dialog();
		big_message.show(rej_text,'(((', false);

	},

	accepted_invite: function() {

		//убираем запрос на игру если он открыт
		req_dialog.hide();
		
		//устанаваем окончательные данные оппонента
		opp_data=cards_menu._opp_data;
		
		//сразу карточку оппонента
		make_text(objects.opp_card_name,opp_data.name,160);
		objects.opp_card_rating.text=opp_data.rating;
		objects.opp_avatar.texture=objects.invite_avatar.texture;		

		cards_menu.close();
		online_player.activate("master");
	},

	back_button_down: function() {

		if (objects.td_cont.visible === true || objects.big_message_cont.visible === true ||objects.req_cont.visible === true ||objects.invite_cont.visible === true)	{
			sound.play('locked');
			return
		};



		sound.play('click');

		this.close();
		main_menu.activate();

	}

}

stickers={

	show_panel: function() {


		if (any_dialog_active===1) {
			sound.play('locked');
			return
		};
		any_dialog_active=1;

		if (objects.stickers_cont.ready===false)
			return;
		sound.play('click');


		//ничего не делаем если панель еще не готова
		if (objects.stickers_cont.ready===false || objects.stickers_cont.visible===true || state!=="p")
			return;

		//анимационное появление панели стикеров
		anim2.add(objects.stickers_cont,{y:[450,objects.stickers_cont.sy]},true,0.4,'easeOutBack');
	},

	hide_panel: function() {

		sound.play('close');

		if (objects.stickers_cont.ready===false)
			return;

		any_dialog_active=0;

		//убираем панель стикеров
		anim2.add(objects.stickers_cont,{y:[objects.stickers_cont.y,450]},false,0.4,'easeOutBack');

	},

	send : function(id) {

		if (objects.stickers_cont.ready===false)
			return;

		this.hide_panel();

		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MSG",tm:Date.now(),data:id});
		message.add(['Стикер отправлен сопернику','The sticker was sent to the opponent'][LANG]);
		

		//показываем какой стикер мы отправили
		objects.sent_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
		anim2.add(objects.sent_sticker_area,{alpha:[0, 0.5]},true,0.4,'linear');
		//objects.sticker_area.visible=true;
		//убираем стикер через 5 секунд
		if (objects.sent_sticker_area.timer_id!==undefined)
			clearTimeout(objects.sent_sticker_area.timer_id);
															
		objects.sent_sticker_area.timer_id=setTimeout(()=>{anim2.add(objects.sent_sticker_area,{alpha:[0.5, 0]},false,0.4,'linear')}, 3000);

	},

	receive: function(id) {

		//воспроизводим соответствующий звук
		sound.play('receive_sticker');

		objects.rec_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;

		anim2.add(objects.rec_sticker_area,{x:[-150, objects.rec_sticker_area.sx]},true,0.4,'easeOutBack')

		//убираем стикер через 5 секунд
		if (objects.rec_sticker_area.timer_id!==undefined)
			clearTimeout(objects.rec_sticker_area.timer_id);
															
		objects.rec_sticker_area.timer_id=setTimeout(()=>{anim2.add(objects.rec_sticker_area,{x:[objects.rec_sticker_area.x, -150]},false,0.4,'easeInBack')}, 5000);

	}


}

auth1 = {
		
	load_script : function(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
		
	get_random_name : function(e_str) {
		
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
	
	init : async function() {	
			
		if (game_platform === 'YANDEX') {
			
			
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};									
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.name 	= _player.getName();
			my_data.uid 	= _player.getUniqueID().replace(/\//g, "Z");
			my_data.pic_url = _player.getPhoto('medium');						
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
			my_data.uid 	= "vk"+_player.id;
			my_data.pic_url = _player.photo_100;
			
			return;
			
		}
		
	}
	
}

auth2 = {
		
	load_script : function(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
			
	get_random_char : function() {		
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return chars[irnd(0,chars.length-1)];
		
	},
	
	get_random_uid_for_local : function(prefix) {
		
		let uid = prefix;
		for ( let c = 0 ; c < 12 ; c++ )
			uid += this.get_random_char();
		
		//сохраняем этот uid в локальном хранилище
		try {
			localStorage.setItem('poker_uid', uid);
		} catch (e) {alert(e)}
					
		return uid;
		
	},
	
	get_random_name : function(uid) {
		
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
	
	get_country_code : async function() {
		
		let country_code = ''
		try {
			let resp1 = await fetch("https://ipinfo.io/json");
			let resp2 = await resp1.json();			
			country_code = resp2.country;			
		} catch(e){}

		return country_code;
		
	},
	
	search_in_local_storage : function() {
		
		//ищем в локальном хранилище
		let local_uid = null;
		
		try {
			local_uid = localStorage.getItem('poker_uid');
		} catch (e) {alert(e)}
				
		if (local_uid !== null) return local_uid;
		
		return undefined;	
		
	},
	
	init : async function() {	
				
		if (game_platform === 'YANDEX') {			
		
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};										
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '');
			my_data.name = _player.getName();
			my_data.pic_url = _player.getPhoto('medium');
			
			if (my_data.pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';
			
			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);
			
			//если английский яндекс до добавляем к имени страну
			let country_code = await this.get_country_code();
			my_data.name = my_data.name + ' (' + country_code + ')';			


			
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
			my_data.uid 	= "vk"+_player.id;
			my_data.pic_url = _player.photo_100;
			
			return;
			
		}
		
		if (game_platform === 'GOOGLE_PLAY') {	

			let country_code = await this.get_country_code();
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			return;
		}
		
		if (game_platform === 'DEBUG') {		

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';		
			return;
		}
		
		if (game_platform === 'CRAZYGAMES') {
			
			let country_code = await this.get_country_code();
			try {await this.load_script('https://sdk.crazygames.com/crazygames-sdk-v1.js')} catch (e) {alert(e)};			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('CG_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			let crazysdk = window.CrazyGames.CrazySDK.getInstance();
			crazysdk.init();			
			return;
		}
		
		if (game_platform === 'UNKNOWN') {
			
			//если не нашли платформу
			alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
		}
	}
	
}

resize=function() {
    const vpw = window.innerWidth;  // Width of the viewport
    const vph = window.innerHeight; // Height of the viewport
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

set_state=function(params) {

	if (params.state!==undefined)
		state=params.state;

	if (params.hidden!==undefined)
		h_state=+params.hidden;

	let small_opp_id="";
	if (opp_data.uid!==undefined)
		small_opp_id=opp_data.uid.substring(0,10);

	if(no_invite===false || state==='p')
		firebase.database().ref(room_name + "/" + my_data.uid).set({state:state, name:my_data.name, rating : my_data.rating, hidden:h_state, opp_id : small_opp_id});

}

vis_change=function() {

	if (document.hidden === true)
		hidden_state_start = Date.now();
	
	set_state({hidden : document.hidden});
	
		
}

async function load_resources() {
	
	document.getElementById("m_progress").style.display = 'flex';

	git_src="https://akukamil.github.io/chess_gp/"
	//git_src=""

	//подпапка с ресурсами
	let lang_pack = ['RUS','ENG'][LANG];

	game_res=new PIXI.Loader();
	game_res.add("m2_font", git_src+"fonts/MS_Comic_Sans/font.fnt");

	game_res.add('receive_move',git_src+'sounds/receive_move.mp3');
	game_res.add('receive_sticker',git_src+'sounds/receive_sticker.mp3');
	game_res.add('message',git_src+'sounds/message.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('draw',git_src+'sounds/draw.mp3');
	game_res.add('eaten',git_src+'sounds/eaten.mp3');
	game_res.add('win',git_src+'sounds/win.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('click2',git_src+'sounds/click2.mp3');
	game_res.add('mini_dialog',git_src+'sounds/mini_dialog.mp3');
	game_res.add('pawn_replace_dialog',git_src+'sounds/pawn_replace_dialog.mp3');
	game_res.add('pawn_replace',git_src+'sounds/pawn_replace.mp3');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('move',git_src+'sounds/move.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('clock',git_src+'sounds/clock.mp3');
	game_res.add('keypress',git_src+'sounds/keypress.mp3');
	game_res.add('test_your_might',git_src+'sounds/test_your_might.mp3');
	game_res.add('mk_ring',git_src+'sounds/mk_ring.mp3');
	game_res.add('mk_haha',git_src+'sounds/mk_haha.mp3');
	game_res.add('mk_impressive',git_src+'sounds/mk_impressive.mp3');
	game_res.add('mk_outstanding',git_src+'sounds/mk_outstanding.mp3');
	game_res.add('mk_excelent',git_src+'sounds/mk_excelent.mp3');
	game_res.add('hit',git_src+'sounds/hit.mp3');
	game_res.add('mk_haha2',git_src+'sounds/mk_haha2.mp3');
	
	//добавляем фигуры отдельно
	['p','r','n','b','k','q'].forEach(n => {		
		let fn = 'b' + n;
		game_res.add(fn, git_src+"pieces/"+fn+".png");		
		fn = 'w' + n;
		game_res.add(fn, git_src+"pieces/"+fn+".png");		
	})

    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++)
        if (load_list[i].class === "sprite" || load_list[i].class === "image" )
            game_res.add(load_list[i].name, git_src+'res/'+lang_pack+'/'+load_list[i].name+"."+load_list[i].image_format);	

	//добавляем текстуры стикеров
	for (var i=0;i<16;i++)
		game_res.add("sticker_texture_"+i, git_src+"stickers/"+i+".png");

	game_res.onProgress.add(progress);
	function progress(loader, resource) {
		document.getElementById("m_bar").style.width =  Math.round(loader.progress)+"%";
	}
	
	//короткое обращение к ресурсам
	gres=game_res.resources;
	
	await new Promise((resolve, reject)=> game_res.load(resolve))
	
	//убираем элементы загрузки
	document.getElementById("m_progress").outerHTML = "";	
}

language_dialog = {
	
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
	
	if (s.includes('yandex')) {
		
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

	if (s.includes('google_play')) {
			
		game_platform = 'GOOGLE_PLAY';	
		LANG = await language_dialog.show();
		return;	
	}	
	
	if (s.includes('192.168')) {
			
		game_platform = 'DEBUG';	
		LANG = 1;
		return;	
	}	
	
	game_platform = 'UNKNOWN';	
	LANG = await language_dialog.show();
	
	

}

async function init_game_env(lang) {
		
	await define_platform_and_language();
	console.log(game_platform, LANG);
						
	//отображаем шкалу загрузки
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;	}body {display: flex;align-items: center;justify-content: center;background-color: rgba(41,41,41,1);flex-direction: column	}#m_progress {	  background: #1a1a1a;	  justify-content: flex-start;	  border-radius: 5px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 1px 0 rgba(255, 255, 255, .5) inset;	  border-radius: 5px;	  background: rgb(119, 119, 119);	  height: 70%;	  width: 0%;	}	</style></div><div id="m_progress">  <div id="m_bar"></div></div>';
			
	await load_resources();
	
	if ((game_platform === 'YANDEX' || game_platform === 'VK') && LANG === 0)
		await auth1.init();
	else
		await auth2.init();

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

	
	app = new PIXI.Application({width:M_WIDTH, height:M_HEIGHT,antialias:false,backgroundColor : 0x404040});
	document.body.appendChild(app.view);

	resize();
	window.addEventListener("resize", resize);

    //создаем спрайты и массивы спрайтов и запускаем первую часть кода
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)

        switch (obj_class) {
        case "sprite":
            objects[obj_name] = new PIXI.Sprite(game_res.resources[obj_name].texture);
            eval(load_list[i].code0);
            break;

        case "block":
            eval(load_list[i].code0);
            break;

        case "cont":
            eval(load_list[i].code0);
            break;

        case "array":
			var a_size=load_list[i].size;
			objects[obj_name]=[];
			for (var n=0;n<a_size;n++)
				eval(load_list[i].code0);
            break;
        }
    }

    //обрабатываем вторую часть кода в объектах
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)
		
		
        switch (obj_class) {
        case "sprite":
            eval(load_list[i].code1);
            break;

        case "block":
            eval(load_list[i].code1);
            break;

        case "cont":	
			eval(load_list[i].code1);
            break;

        case "array":
			var a_size=load_list[i].size;
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code1);	;
            break;
        }
    }
	
	//запускаем главный цикл
	main_loop();	
	
	//анимация лупы
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+150;
	}
	
	//ждем пока загрузится аватар
	let loader=new PIXI.Loader();
	loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});			
	await new Promise((resolve, reject)=> loader.load(resolve))	
	
	//устанавливаем фотки в попап и другие карточки
	objects.id_avatar.texture=objects.my_avatar.texture=loader.resources.my_avatar.texture;	
	
	//устанавлием имя на карточки
	make_text(objects.id_name,my_data.name,150);
	make_text(objects.my_card_name,my_data.name,150);
		
	
	//получаем остальные данные об игроке
	const _other_data = await firebase.database().ref("players/"+my_data.uid).once('value');
	const other_data = _other_data.val();
	
	//делаем защиту от неопределенности
	my_data.rating = (other_data && other_data.rating) || 1400;
	my_data.games = (other_data && other_data.games) || 0;
	my_data.mk_level=(other_data && other_data.mk_level) || 14;
	my_data.mk_sback_num=(other_data && other_data.mk_sback_num) || 0;
	my_data.quiz_level=(other_data && other_data.quiz_level) || 0;

	//номер комнаты
	if (my_data.rating > 0 && my_data.rating < 1410)
		room_name = 'states'		
	if (my_data.rating >= 1410 && my_data.rating < 1493)
		room_name = 'states2'		
	if (my_data.rating >= 1493 && my_data.rating < 1730)
		room_name = 'states3'		
	if (my_data.rating >= 1730)
		room_name= 'states4';			

	//room_name= 'states5';	
	//устанавливаем рейтинг в попап
	objects.id_rating.text=objects.my_card_rating.text=my_data.rating;

	//убираем лупу
	objects.id_loup.visible=false;

	//обновляем почтовый ящик
	firebase.database().ref("inbox/"+my_data.uid).set({sender:"-",message:"-",tm:"-",data:{x1:0,y1:0,x2:0,y2:0,board_state:0}});

	//подписываемся на новые сообщения
	firebase.database().ref("inbox/"+my_data.uid).on('value', (snapshot) => { process_new_message(snapshot.val());});

	//обновляем данные в файербейс так как могли поменяться имя или фото
	firebase.database().ref("players/"+my_data.uid).set({name:my_data.name, pic_url: my_data.pic_url, rating : my_data.rating, quiz_level : my_data.quiz_level, games : my_data.games, games : my_data.games, mk_level : my_data.mk_level,mk_sback_num:my_data.mk_sback_num, tm:firebase.database.ServerValue.TIMESTAMP});

	//устанавливаем мой статус в онлайн
	set_state({state : 'o'});

	//отключение от игры и удаление не нужного
	firebase.database().ref("inbox/"+my_data.uid).onDisconnect().remove();
	firebase.database().ref(room_name+"/"+my_data.uid).onDisconnect().remove();

	//это событие когда меняется видимость приложения
	document.addEventListener("visibilitychange", vis_change);

	//keep-alive сервис
	setInterval(function()	{keep_alive()}, 40000);

	//убираем лупу
	some_process.loup_anim = function(){};
	objects.id_loup.visible=false;
		
	//ждем и убираем попап
	await new Promise((resolve, reject) => setTimeout(resolve, 1000));
	anim2.add(objects.id_cont,{y:[objects.id_cont.y,-180]}, false, 0.6,'easeInBack');	
	
	//контроль за присутсвием
	var connected_control = firebase.database().ref(".info/connected");
	connected_control.on("value", (snap) => {
	  if (snap.val() === true) {
		connected = 1;
	  } else {
		connected = 0;
	  }
	});
	
	//событие ролика мыши в карточном меню и нажатие кнопки
	window.addEventListener("wheel", event => cards_menu.wheel_event(Math.sign(event.deltaY)));
	window.addEventListener('keydown', function(event) { feedback.key_down(event.key)});

	
	//показыаем основное меню
	main_menu.activate();
	
	console.clear()

}

function main_loop() {

	//глобальная функция
	g_process();

	game_tick+=0.016666666;
	
	//обрабатываем минипроцессы
	for (let key in some_process)
		some_process[key]();	
	
	anim2.process();

	requestAnimationFrame(main_loop);
}

