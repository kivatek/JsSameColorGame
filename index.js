const MAX_ROWS = 5;
const MAX_COLUMNS = 6;

function Format(format /*,obj1,obj2...*/) {
    var args = arguments;
    return format.replace(/\{(\d)\}/g, function(m, c) { return args[parseInt(c) + 1] });
}

function drawCursor() {
	if ((oldx >= 0) && (oldy >= 0)) {
		var oldi = Format("dx{0}y{1}", oldx, oldy);
		var olde = document.getElementById(oldi);
		olde.innerHTML = '';
	}
	var i = Format("dx{0}y{1}", cx, cy);
	var e = document.getElementById(i);
	e.innerHTML = '<img src="img/cursor.png"/>';
}

function drawTiles() {
	for (var y = 0; y < tiles.length; y++) {
		for (var x = 0; x < tiles[0].length; x++) {
			var i = Format("tx{0}y{1}", x, y);
			var t = document.getElementById(i);
			var c = tiles[y][x];
			if (c == 1) {
				t.style.backgroundColor = 'red';
			} else if (c == 2) {
				t.style.backgroundColor = 'green';
			} else if (c == 3) {
				t.style.backgroundColor = 'blue';
			} else if (c == 4) {
				t.style.backgroundColor = 'silver';
			} else {
				t.style.backgroundColor = 'white';
			}
			//console.log(t.style.backgroundColor);
		}
	}
}

// 同色タイルを消したことを一拍見せた後に下方へずらす処理。
function checkTileColor(x, y, c) {
	if ((x >= 0) && (x < tiles[0].length) && (y >= 0) && (y < tiles.length)) {
		if (tiles[y][x] != c) {
			return;
		}
		if (check[y][x] == 1) {
			return;
		}
		check[y][x] = 1;
		checkTileColor(x, y-1, c);
		checkTileColor(x-1, y, c);
		checkTileColor(x+1, y, c);
		checkTileColor(x, y+1, c);
	}
}

function eraseTiles() {
	for (var y = 0; y < check.length; y++) {
		for (var x = 0; x < check[0].length; x++) {
			check[y][x] = 0;
		}
	}
	checkTileColor(cx, cy, tiles[cy][cx]);
	var v = 0;
	for (var y = 0; y < check.length; y++) {
		for (var x = 0; x < check[0].length; x++) {
			if (check[y][x] == 1) {
				tiles[y][x] = 0;
				v++;
			}
		}
	}
	if (v > 0) {
		drawTiles();
		phase = 1;
		setTimeout(fall, 400);
	}
}

function fall() {
	for (var x = 0; x < tiles[0].length; x++) {
		for (var y = tiles.length-1; y > 0; y--) {
			if (tiles[y][x] != 0) {
				continue;
			}
			for (var y2 = y-1; y2 >= 0; y2--) {
				if (tiles[y2][x] == 0) {
					continue;
				}
				tiles[y][x] = tiles[y2][x];
				tiles[y2][x] = 0;
				break;
			}
		}
	}
	// スライドが発生する可能性を追加チェック
	var s = false;
	for (var x = 0; x < tiles[0].length-1; x++) {
		var v = 0;
		for (var y = 0; y < tiles.length; y++) {
			if (tiles[y][x] == 0) {
				v++;
			}
		}
		if (v == tiles.length) {
			s = true;
		}
	}
	drawTiles();
	if (s) {
		setTimeout(slide, 400);
	} else {
		phase = 0;
	}
}

function slide() {
	var v = new Array();
	for (var x = 0; x < tiles[0].length; x++) {
		var i = 0;
		// チェック中の行に何個の空きがあるかを調べる
		for (var y = 0; y < tiles.length; y++) {
			if (tiles[y][x] == 0) {
				i++;
			}
		}
		// 空いているマスの数を記録する。
		v.push(i);
	}

	for (var x = 0; x < tiles[0].length-1; x++) {
		while (v[x] == tiles.length) {
			// 全てのマスが空いているようであればチェック中の列より右側の列を全てスライド。
			// 元のマスは空白扱いとする
			for (var x2 = x; x2 < tiles[0].length-1; x2++) {
				for (var y2 = 0; y2 < tiles.length; y2++) {
					tiles[y2][x2] = tiles[y2][x2+1];
					tiles[y2][x2+1] = 0;
				}
				// 空いている列情報もシフト
				v[x2] = v[x2+1];
				v[x2+1] = 0;
			}
			// スライドしても全てのマスが空いた状態であればスライドを繰り返す。
		}
	}
	drawTiles();
	phase = 0;
}

function shuffle() {
	for (var y = 0; y < tiles.length; y++) {
		for (var x = 0; x < tiles[0].length; x++) {
			// ４色使用する。
			tiles[y][x] = Math.floor(Math.random() * 4) + 1;
		}
	}
}

function prepare() {
	for(var y = 0; y < MAX_ROWS; y++) {
		tiles[y] = new Array();
		check[y] = new Array();
		for(var x = 0; x < MAX_COLUMNS; x++) {
			tiles[y].push(0);
			check[y].push(0);
		}
	}
}

window.onkeydown = function(e) {

	if (phase != 0) {
		return;
	}

	var k = e.keyCode;
	//console.log(k);
	// 37: left
	// 38: up
	// 39: right
	// 40: down
	if (k == 32) {
		eraseTiles();
	} else {
		k = k - 37;
		oldx = cx;
		oldy = cy;
		if (k == 0) {
			cx = Math.max(0, cx - 1);
		}
		else if (k == 1) {
			cy = Math.max(0, cy - 1);
		}
		else if (k == 2) {
			cx = Math.min(tiles[0].length-1, cx + 1);
		}
		else if (k == 3) {
			cy = Math.min(tiles[0].length-1, cy + 1);
		}
		drawCursor();
	}
}

window.onload = function() {
	// タイル毎の色情報を覚える配列
	tiles = [];
	
	// タイルを消した後の隙間を詰める際に使用する配列
	check = [];
	
	// 配列を初期化
	prepare();
	
	phase = 0;
	oldx = -1;
	oldy = -1;
	cx = 0;
	cy = 0;
	
	shuffle();
	drawTiles();
	drawCursor();
};
