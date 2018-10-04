new Vue({
	el: '#app',
	data: {
		gameOver: false,
		message: 'Game Over',
		positionX: 500,
		positionY: 100,
		flashLightAngle: 0,
		score: 0,
		PIXEL_SIZE: 30,
		PIXEL_SIZE_X: Math.floor(window.innerWidth / 50),
		PIXEL_SIZE_Y: Math.floor(window.innerHeight / 20),
		PIXEL_COUNT: Math.floor(window.innerWidth * window.innerHeight / 3000),
		GHOSTS_COUNT: Math.floor(window.innerWidth * window.innerHeight / 60000),
		ghostsArr: [],
		taggedGhostsArr: []
	},
	methods: {
		getRndInteger(axis, max) {
			if (axis === 'x') {
				return this.PIXEL_SIZE_X + this.PIXEL_SIZE_X * Math.floor(Math.random() * (max / this.PIXEL_SIZE_X))
			} else {
				return this.PIXEL_SIZE_Y + this.PIXEL_SIZE_Y * Math.floor(Math.random() * (max / this.PIXEL_SIZE_Y))
			}
		},
		dist(a, b) {
			return Math.abs(a - b);
		},
		initGame() {
			let _this = this
			const Lamp = illuminated.Lamp,
				RectangleObject = illuminated.RectangleObject,
				DiscObject = illuminated.DiscObject,
				Vec2 = illuminated.Vec2,
				Lighting = illuminated.Lighting,
				DarkMask = illuminated.DarkMask;

			const keyCodes = {
					left: 37,
					up: 38,
					right: 39,
					down: 40
				},
				keys = [];

			document.addEventListener('keydown', function (evt) {
				keys[evt.keyCode] = true;
			});

			document.addEventListener('keyup', function (evt) {
				keys[evt.keyCode] = false;
			});
			document.addEventListener('mousemove', (event) => {
				_this.positionX = event.clientX
				_this.positionY = event.clientY
			})
			document.addEventListener('wheel', (event) => {
				if (event.deltaY) {
					if (event.deltaY < 0) {
						_this.flashLightAngle -= 1
					} else {
						_this.flashLightAngle += 1
					}
				}
			})

			const canvas = document.querySelector("#canvas_container canvas");
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
			const ctx = canvas.getContext("2d");

			// const light1 = new Lamp({
			// 	position: new Vec2(parseInt(_this.positionX), parseInt(_this.positionY)),
			// 	distance: 200,
			// 	radius: 10,
			// 	samples: 50
			// });
			const light2 = new Lamp({
				position: new Vec2(parseInt(_this.positionX), parseInt(_this.positionY)),
				color: '#d66a00',
				distance: 180,
				radius: 5,
				samples: 3,
				// angle: _this.flashLightAngle,
				// roughness: .9
			});

			var objArr = []
			var maskArr = []
			for (let x = 0; x <= _this.PIXEL_COUNT; x++) {
				let randX = _this.getRndInteger('x', window.innerWidth - _this.PIXEL_SIZE_X)
				let randY = _this.getRndInteger('y', window.innerHeight - _this.PIXEL_SIZE_Y)
				maskArr.push({
					x: randX,
					y: randY
				});
				objArr.push(new RectangleObject({
					topleft: new Vec2(randX, randY),
					bottomright: new Vec2((randX + _this.PIXEL_SIZE_X), randY + _this.PIXEL_SIZE_Y)
				}))
			}

			console.log('maskArr: ', objArr);
			// generate ghosts
			// for (let x = 0; x < objArr.length; x++) {
			// check if x and y is occupied else generate nww cords
			let randX, randY
			console.log('_this.GHOSTS_COUNT: ', _this.GHOSTS_COUNT);
			for (let y = 0; y <= _this.GHOSTS_COUNT; y++) {
				if (_this.ghostsArr.length < _this.GHOSTS_COUNT) {
					do {
						objArr.filter((e) => {
							console.log('e.: ', e.topleft.x === randX && e.topleft.y === randY);
							// return e.topleft.x === randX && e.topleft.y === randY
						});
						randX = _this.getRndInteger('x', window.innerWidth - _this.PIXEL_SIZE_X);
						randY = _this.getRndInteger('y', window.innerHeight - _this.PIXEL_SIZE_Y);
					} while (objArr.filter((e) => {
							return e.topleft.x + (_this.PIXEL_SIZE_X / 2) === randX && e.topleft.y + (_this.PIXEL_SIZE_Y / 2) === randY
						}).length > 0 || _this.ghostsArr.filter((e) => {
							return e.center.x === randX && e.center.y === randY
						}).length > 0)
					console.log("dodaje: ", randX, randY, );
					_this.ghostsArr.push(new DiscObject({
						center: new Vec2(randX - (_this.PIXEL_SIZE_X / 2), randY - (_this.PIXEL_SIZE_Y / 2)),
						radius: 22
					}))
					_this.taggedGhostsArr.push(new DiscObject({
						center: new Vec2(-100, -100),
						radius: 22
					}))

				}
			}
			// }

			const lighting2 = new Lighting({
				light: light2,
				objects: [..._this.ghostsArr, ...objArr]
			});

			const darkmask = new DarkMask({
				// lights: [light1, light2]
				lights: [light2],
				color: 'rgba(0,0,0,1)'
			});

			function render() {
				if (keys[keyCodes.left]) {
					_this.positionX -= 1;
					_this.flashLightAngle = 3
				} else if (keys[keyCodes.right]) {
					_this.positionX += 1;
					_this.flashLightAngle = 0
				}
				// up/down
				if (keys[keyCodes.up]) {
					_this.positionY -= 1;
					_this.flashLightAngle = 1
				} else if (keys[keyCodes.down]) {
					_this.positionY += 1;
					_this.flashLightAngle = 4
				}

				// light1.position = new Vec2(parseInt(_this.positionX), parseInt(_this.positionY));
				light2.position = new Vec2(parseInt(_this.positionX), parseInt(_this.positionY));
				light2.angle = parseInt(_this.flashLightAngle);

				// lighting1.compute(canvas.width, canvas.height);
				lighting2.compute(canvas.width, canvas.height);
				darkmask.compute(canvas.width, canvas.height);

				ctx.fillStyle = "#1e1308";
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.fillStyle = "#1e1308";
				for (let x = 0; x < objArr.length; x++) {
					ctx.beginPath();
					objArr[x].path(ctx);
					ctx.fill();
				}

				for (let x = 0; x < _this.ghostsArr.length; x++) {
					ctx.fillStyle = _this.taggedGhostsArr[x].center.x === _this.ghostsArr[x].center.x && _this.taggedGhostsArr[x].center.y === _this.ghostsArr[x].center.y ? "#ff0000" : "#cee3e8";
					ctx.beginPath();
					_this.ghostsArr[x].path(ctx);
					ctx.fill();
				}

				ctx.globalCompositeOperation = "lighter";
				// lighting1.render(ctx);
				lighting2.render(ctx);

				ctx.globalCompositeOperation = "source-over";
				darkmask.render(ctx);
				for (let x = 0; x < objArr.length; x++) {
					ctx.fillStyle = "#1e1308";
					ctx.fillRect(maskArr[x].x, maskArr[x].y, _this.PIXEL_SIZE_X, _this.PIXEL_SIZE_Y);
				}
				ctx.fillStyle = "#1e1308";
				ctx.fillRect(0, 0, window.innerWidth, 6);
				ctx.fillRect(0, window.innerHeight - 6, window.innerWidth, 6);
				ctx.fillRect(window.innerWidth - 6, 0, 6, window.innerHeight);
				ctx.fillRect(0, 0, 6, window.innerHeight);

			}
			document.addEventListener('click', (e) => {
				for (let x = 0; x < _this.ghostsArr.length; x++) {
					let distX = _this.dist(e.clientX, _this.ghostsArr[x].center.x);
					let distY = _this.dist(e.clientY, _this.ghostsArr[x].center.y);
					if (distX <= 10 && distY <= 10) {
						_this.taggedGhostsArr[x].center.x = _this.ghostsArr[x].center.x
						_this.taggedGhostsArr[x].center.y = _this.ghostsArr[x].center.y
						_this.score += 1
					}
				}
			})

			requestAnimFrame(function loop() {
				requestAnimFrame(loop, canvas);
				render();
			}, canvas);
		}
	},
	mounted() {
		this.initGame()
	}
})
