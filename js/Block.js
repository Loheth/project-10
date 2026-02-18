function Block(fallingLane, color, iter, distFromHex, settled) {
	this.settled = (settled === undefined) ? 0 : 1;
	this.height = settings.blockHeight;
	this.fallingLane = fallingLane;

		this.checked=0;
	this.angle = 90 - (30 + 60 * fallingLane);
	this.angularVelocity = 0;
	this.targetAngle = this.angle;
	this.color = color;
	this.deleted = 0;
	this.removed = 0;
	this.tint = 0;
	this.opacity = 1;
	this.initializing = 1;
	this.ict = MainHex.ct;
	this.iter = iter;
	this.initLen = settings.creationDt;
	this.attachedLane = 0;
	this.distFromHex = distFromHex || settings.startDist * settings.scale ;

	this.incrementOpacity = function() {
		if (this.deleted) {
			if (this.opacity >= 0.925) {
				var tLane = this.attachedLane - MainHex.position;
				tLane = MainHex.sides - tLane;
				while (tLane < 0) {
					tLane += MainHex.sides;
				}

				tLane %= MainHex.sides;
				MainHex.shakes.push({lane:tLane, magnitude:3 * (window.devicePixelRatio ? window.devicePixelRatio : 1) * (settings.scale)});
			}
			this.opacity = this.opacity - 0.075 * MainHex.dt;
			if (this.opacity <= 0) {
				this.opacity = 0;
				this.deleted = 2;
				if (gameState == 1 || gameState==0) {
					localStorage.setItem("saveState", exportSaveState());
				}
			}
		}
	};

	this.getIndex = function (){
		var parentArr = MainHex.blocks[this.attachedLane];
		for (var i = 0; i < parentArr.length; i++) {
			if (parentArr[i] == this) {
				return i;
			}
		}
	};

	this.draw = function(attached, index) {
		this.height = settings.blockHeight;
		if (Math.abs(settings.scale - settings.prevScale) > 0.000000001) {
			this.distFromHex *= (settings.scale/settings.prevScale);
		}

		this.incrementOpacity();
		if(attached === undefined)
			attached = false;

		if(this.angle > this.targetAngle) {
			this.angularVelocity -= angularVelocityConst * MainHex.dt;
		}
		else if(this.angle < this.targetAngle) {
			this.angularVelocity += angularVelocityConst * MainHex.dt;
		}

		if (Math.abs(this.angle - this.targetAngle + this.angularVelocity) <= Math.abs(this.angularVelocity)) {
			this.angle = this.targetAngle;
			this.angularVelocity = 0;
		}
		else {
			this.angle += this.angularVelocity;
		}
		
		this.width = 2 * this.distFromHex / Math.sqrt(3);
		this.widthWide = 2 * (this.distFromHex + this.height) / Math.sqrt(3);
		var p1;
		var p2;
		var p3;
		var p4;
		if (this.initializing) {
			var rat = ((MainHex.ct - this.ict)/this.initLen);
			if (rat > 1) {
				rat = 1;
			}
			p1 = rotatePoint((-this.width / 2) * rat, this.height / 2, this.angle);
			p2 = rotatePoint((this.width / 2) * rat, this.height / 2, this.angle);
			p3 = rotatePoint((this.widthWide / 2) * rat, -this.height / 2, this.angle);
			p4 = rotatePoint((-this.widthWide / 2) * rat, -this.height / 2, this.angle);
			if ((MainHex.ct - this.ict) >= this.initLen) {
				this.initializing = 0;
			}
		} else {
			p1 = rotatePoint(-this.width / 2, this.height / 2, this.angle);
			p2 = rotatePoint(this.width / 2, this.height / 2, this.angle);
			p3 = rotatePoint(this.widthWide / 2, -this.height / 2, this.angle);
			p4 = rotatePoint(-this.widthWide / 2, -this.height / 2, this.angle);
		}

		if (this.deleted) {
			ctx.fillStyle = "#FFF";
		} else if (gameState === 0) {
			if (this.color.charAt(0) == 'r') {
				ctx.fillStyle = rgbColorsToTintedColors[this.color];
			}
			else {
				ctx.fillStyle = hexColorsToTintedColors[this.color];
			}
		}
		else {
			ctx.fillStyle = this.color;
		}

		ctx.globalAlpha = this.opacity;
		var baseX = trueCanvas.width / 2 + Math.sin((this.angle) * (Math.PI / 180)) * (this.distFromHex + this.height / 2) + gdx;
		var baseY = trueCanvas.height / 2 - Math.cos((this.angle) * (Math.PI / 180)) * (this.distFromHex + this.height / 2) + gdy;
		ctx.beginPath();
		ctx.moveTo(baseX + p1.x, baseY + p1.y);
		ctx.lineTo(baseX + p2.x, baseY + p2.y);
		ctx.lineTo(baseX + p3.x, baseY + p3.y);
		ctx.lineTo(baseX + p4.x, baseY + p4.y);
		ctx.closePath();
		ctx.fill();
		if (gameState === 1 && !this.deleted) {
			ctx.strokeStyle = 'rgba(0,0,0,0.45)';
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}

		// Virus look when game is playing: spikes on outer edge
		if (gameState === 1 && !this.deleted && !this.initializing) {
			var outerCx = (p3.x + p4.x) / 2;
			var outerCy = (p3.y + p4.y) / 2;
			var len = Math.sqrt(outerCx * outerCx + outerCy * outerCy) || 1;
			var nx = outerCx / len;
			var ny = outerCy / len;
			var spikeLen = Math.min(this.height * 0.6, 8 * (window.devicePixelRatio || 1));
			var spikeW = this.widthWide * 0.15;
			var numSpikes = 5;
			ctx.save();
			ctx.fillStyle = this.color;
			ctx.strokeStyle = 'rgba(0,0,0,0.5)';
			ctx.lineWidth = 1;
			for (var s = 0; s < numSpikes; s++) {
				var t = (s + 1) / (numSpikes + 1);
				var sx = baseX + (1 - t) * p4.x + t * p3.x;
				var sy = baseY + (1 - t) * p4.y + t * p3.y;
				var tipX = sx + nx * spikeLen;
				var tipY = sy + ny * spikeLen;
				var perpX = -ny * spikeW;
				var perpY = nx * spikeW;
				ctx.beginPath();
				ctx.moveTo(tipX, tipY);
				ctx.lineTo(sx + perpX, sy + perpY);
				ctx.lineTo(sx - perpX, sy - perpY);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
			ctx.restore();
		}

		// Draw malware type label centered inside the block; scale font so full text fits
		if ((gameState === 1 || gameState === 0) && !this.deleted && colorToMalware) {
			var malware = colorToMalware[this.color];
			if (malware) {
				ctx.save();
				var scale = settings.scale || 1;
				var centerWidth = (this.width + this.widthWide) / 2;
				var maxW = centerWidth * 0.9;
				var maxH = this.height * 0.8;
				var fontSize = Math.min(maxH, 11 * scale);
				ctx.font = "bold " + Math.round(fontSize) + "px Exo 2, sans-serif";
				var m = ctx.measureText(malware.short);
				if (m.width > maxW && maxW > 0) {
					fontSize = Math.min(fontSize, fontSize * (maxW / m.width));
					fontSize = Math.max(4, Math.round(fontSize));
					ctx.font = "bold " + fontSize + "px Exo 2, sans-serif";
				}
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillStyle = "rgba(255,255,255,0.95)";
				ctx.strokeStyle = "rgba(0,0,0,0.6)";
				ctx.lineWidth = 0.8;
				ctx.strokeText(malware.short, baseX, baseY);
				ctx.fillText(malware.short, baseX, baseY);
				ctx.restore();
			}
		}

		if (this.tint) {
			if (this.opacity < 1) {
				if (gameState == 1 || gameState==0) {
					localStorage.setItem("saveState", exportSaveState());
				}

				this.iter = 2.25;
				this.tint = 0;
			}

			ctx.fillStyle = "#FFF";
			ctx.globalAlpha = this.tint;
			ctx.beginPath();
			ctx.moveTo(baseX + p1.x, baseY + p1.y);
			ctx.lineTo(baseX + p2.x, baseY + p2.y);
			ctx.lineTo(baseX + p3.x, baseY + p3.y);
			ctx.lineTo(baseX + p4.x, baseY + p4.y);
			ctx.lineTo(baseX + p1.x, baseY + p1.y);
			ctx.closePath();
			ctx.fill();
			this.tint -= 0.02 * MainHex.dt;
			if (this.tint < 0) {
				this.tint = 0;
			}
		}

		ctx.globalAlpha = 1;
	};
}

function findCenterOfBlocks(arr) {
	var avgDFH = 0;
	var avgAngle = 0;
	for (var i = 0; i < arr.length; i++) {
		avgDFH += arr[i].distFromHex;
		var ang = arr[i].angle;
		while (ang < 0) {
			ang += 360;
		}
		
		avgAngle += ang % 360;
	}

	avgDFH /= arr.length;
	avgAngle /= arr.length;

	return {
		x:trueCanvas.width/2 + Math.cos(avgAngle * (Math.PI / 180)) * avgDFH,
		y:trueCanvas.height/2 + Math.sin(avgAngle * (Math.PI / 180)) * avgDFH
	};
}
