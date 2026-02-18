function Hex(sideLength) {
	this.playThrough = 0;
	this.fillColor = [0, 40, 60];
	this.tempColor = [0, 40, 60];
	this.angularVelocity = 0;
	this.position = 0;
	this.dy = 0;
	this.dt = 1;
	this.sides = 6;
	this.blocks = [];
	this.angle = 180 / this.sides;
	this.targetAngle = this.angle;
	this.shakes = [];
	this.sideLength = sideLength;
	this.strokeColor = 'blue';
	this.x = trueCanvas.width / 2;
	this.y = trueCanvas.height / 2;
	this.ct = 0;
	this.lastCombo = this.ct - settings.comboTime;
	this.lastColorScored = "#000";
	this.comboTime = 1;
	this.texts = [];
		this.lastRotate = Date.now();
	for (var i = 0; i < this.sides; i++) {
		this.blocks.push([]);
	}

	this.shake = function(obj) {
		var angle = 30 + obj.lane * 60;
		angle *= Math.PI / 180;
		var dx = Math.cos(angle) * obj.magnitude;
		var dy = Math.sin(angle) * obj.magnitude;
		gdx -= dx;
		gdy += dy;
		obj.magnitude /= 2 * (this.dt+0.5);
		if (obj.magnitude < 1) {
			for (var i = 0; i < this.shakes.length; i++) {
				if (this.shakes[i] == obj) {
					this.shakes.splice(i, 1);
				}
			}
		}
	};

	this.addBlock = function(block) {
		if (!(gameState == 1 || gameState === 0)) return;
		block.settled = 1;
		block.tint = 0.6;
		var lane = this.sides - block.fallingLane;
		this.shakes.push({lane:block.fallingLane, magnitude:4.5 * (window.devicePixelRatio ? window.devicePixelRatio : 1) * (settings.scale)});
		lane += this.position;
		lane = (lane + this.sides) % this.sides;
		block.distFromHex = MainHex.sideLength / 2 * Math.sqrt(3) + block.height * this.blocks[lane].length;
		this.blocks[lane].push(block);
		block.attachedLane = lane;
		block.checked = 1;
	};

	this.doesBlockCollide = function(block, position, tArr) {
		if (block.settled) {
			return;
		}

		if (position !== undefined) {
			arr = tArr;
			if (position <= 0) {
				if (block.distFromHex - block.iter * this.dt * settings.scale - (this.sideLength / 2) * Math.sqrt(3) <= 0) {
					block.distFromHex = (this.sideLength / 2) * Math.sqrt(3);
					block.settled = 1;
					block.checked = 1;
				} else {
					block.settled = 0;
					block.iter = 1.5 + (waveone.difficulty/15) * 3;
				}
			} else {
				if (arr[position - 1].settled && block.distFromHex - block.iter * this.dt * settings.scale - arr[position - 1].distFromHex - arr[position - 1].height <= 0) {
					block.distFromHex = arr[position - 1].distFromHex + arr[position - 1].height;
					block.settled = 1;
					block.checked = 1;
				}
				else {
					block.settled = 0;
					block.iter = 1.5 + (waveone.difficulty/15) * 3;
				}
			}
		} else {
			var lane = this.sides - block.fallingLane;
			lane += this.position;

			lane = (lane+this.sides) % this.sides;
			var arr = this.blocks[lane];

			if (arr.length > 0) {
				if (block.distFromHex + block.iter * this.dt * settings.scale - arr[arr.length - 1].distFromHex - arr[arr.length - 1].height <= 0) {
					block.distFromHex = arr[arr.length - 1].distFromHex + arr[arr.length - 1].height;
					this.addBlock(block);
				}
			} else {
				if (block.distFromHex + block.iter * this.dt * settings.scale - (this.sideLength / 2) * Math.sqrt(3) <= 0) {
					block.distFromHex = (this.sideLength / 2) * Math.sqrt(3);
					this.addBlock(block);
				}
			}
		}
	};

	this.rotate = function(steps) {
				if(Date.now()-this.lastRotate<75 && !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) return;
		if (!(gameState === 1 || gameState === 0)) return;
		this.position += steps;
		if (!history[this.ct]) {
			history[this.ct] = {};
		}

		if (!history[this.ct].rotate) {
			history[this.ct].rotate = steps;
		}
		else {
			history[this.ct].rotate += steps;
		}

		while (this.position < 0) {
			this.position += 6;
		}

		this.position = this.position % this.sides;
		this.blocks.forEach(function(blocks) {
			blocks.forEach(function(block) {
				block.targetAngle = block.targetAngle - steps * 60;
			});
		});

		this.targetAngle = this.targetAngle - steps * 60;
				this.lastRotate = Date.now();
	};

	this.draw = function() {
		this.x = trueCanvas.width/2;

		if (gameState != -2) {
			this.y = trueCanvas.height/2;
		}
		this.sideLength = settings.hexWidth;
		gdx = 0;
		gdy = 0;
		for (var i = 0; i < this.shakes.length; i++) {
			this.shake(this.shakes[i]);
		}
		if (this.angle > this.targetAngle) {
			this.angularVelocity -= angularVelocityConst * this.dt;
		}
		else if(this.angle < this.targetAngle) {
			this.angularVelocity += angularVelocityConst * this.dt;
		}

		if (Math.abs(this.angle - this.targetAngle + this.angularVelocity) <= Math.abs(this.angularVelocity)) {
			this.angle = this.targetAngle;
			this.angularVelocity = 0;
		}
		else {
			this.angle += this.angularVelocity;
		}
 
		if (gameState === 1 || gameState === 0) {
			// Computer firewall look: dark tech base, panel segments, glowing border, shield icon
			var cx = this.x + gdx;
			var cy = this.y + gdy + this.dy;
			var firewallFill = 'rgb(6, 20, 42)';
			var glowColor = '#00d4ff';
			var innerGlow = 'rgba(0, 212, 255, 0.4)';
			var segmentColor = 'rgba(0, 212, 255, 0.2)';
			drawPolygon(cx, cy, this.sides, this.sideLength, this.angle, firewallFill, 0, 'rgba(0,0,0,0)');
			// Panel segment lines (center to each vertex) so it looks like a firewall shield
			var vert = rotatePoint(0, this.sideLength, this.angle);
			var vx = vert.x;
			var vy = vert.y;
			ctx.strokeStyle = segmentColor;
			ctx.lineWidth = 1;
			for (var i = 0; i < this.sides; i++) {
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(cx + vx, cy + vy);
				ctx.stroke();
				var next = rotatePoint(vx, vy, 60);
				vx = next.x;
				vy = next.y;
			}
			// Inner shield hex
			var innerRadius = this.sideLength * 0.68;
			drawPolygon(cx, cy, this.sides, innerRadius, this.angle, 'rgba(0,0,0,0)', 1, innerGlow);
			ctx.stroke();
			// Outer glow border
			ctx.strokeStyle = glowColor;
			ctx.lineWidth = 2.5 * (window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1);
			drawPolygon(cx, cy, this.sides, this.sideLength, this.angle, 'rgba(0,0,0,0)', ctx.lineWidth, glowColor);
			// Shield icon in center
			ctx.save();
			ctx.translate(cx, cy);
			ctx.font = (this.sideLength * 0.45) + 'px FontAwesome';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = 'rgba(0, 212, 255, 0.85)';
			ctx.fillText(String.fromCharCode(0xf132), 0, 0);
			ctx.restore();
			ctx.strokeStyle = 'rgba(0,0,0,0)';
		} else {
			drawPolygon(this.x + gdx, this.y + gdy + this.dy, this.sides, this.sideLength, this.angle, arrayToColor(this.fillColor), 0, 'rgba(0,0,0,0)');
		}
	};
}

function arrayToColor(arr){
	return 'rgb(' + arr[0]+ ','+arr[1]+','+arr[2]+')';
}
