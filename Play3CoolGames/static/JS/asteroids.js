
const _screen = document.querySelector('.screen');
const sContext = _screen.getContext('2d');

let sWidth;
let sHeight;


let Keys = {
	ArrowUp:false,
	ArrowRight:false,
	ArrowLeft:false,
	SKey:false
};
const SPACE = ' ';
let HOLD = false;

let ListAsteroids = [];
let ListBullets = [];
let Player = new SpaceObject();
let Dead = false;

let ShipModel = [];
let AsteroidModel = [];

let Score = 0;

let t1,t2;


requestAnimationFrame(start)

function start()
{
	
	AddEventsListeners();
	_screen.width = 600;
	_screen.height = 600;
	sWidth = _screen.width;
	sHeight = _screen.height;

	ShipModel.push(
		{x:0,    y:-5},
		{x:-2.5, y:2.5},
		{x:2.5,  y:2.5}
	); // A simple Isoceles Triangle

	let verts = 20;
	for (let i = 0; i < verts; i++)
	{
		let radius = Math.random() * 0.4 + 0.8;
		let a = (i / verts) * 2*Math.PI;
		AsteroidModel.push(
			{x: radius * Math.sin(a), y: radius * Math.cos(a)}
		);
	}

	InitResetGame();

	t1 = new Date().getTime();
	mainLoop();
}

function mainLoop()
{
	t2 = new Date().getTime();
	let elapsedTime = t2 - t1;
	elapsedTime /= 100;
	t1 = t2;

	ClearFunc();
	UpdateFunc(elapsedTime);
	DrawFunc();
	requestAnimationFrame(mainLoop);
}

function ClearFunc()
{
	sContext.clearRect( 0,0, sWidth,sHeight );
}

function UpdateFunc(elapsedTime)
{
	if (Dead)
		InitResetGame();

	
	if (Keys.ArrowRight)
		Player.angle += 0.5 * elapsedTime;
	if (Keys.ArrowLeft)
		Player.angle -= 0.5 * elapsedTime;

	
	if (Keys.ArrowUp)
	{
		
		Player.dx += Math.sin(Player.angle) * elapsedTime;
		Player.dy += -Math.cos(Player.angle) * elapsedTime;
	}

	if (Keys.SKey && !HOLD)
	{
		ListBullets.push(new SpaceObject(
			Player.x,Player.y,
			50 * Math.sin(Player.angle), -50 * Math.cos(Player.angle), 0,0
		));
		HOLD = true;
	}

	
	Player.x += Player.dx * elapsedTime;
	Player.y += Player.dy * elapsedTime;


	[Player.x, Player.y] = WrapCoordinates(Player.x, Player.y);

	for (let asteroid of ListAsteroids)
	{
		asteroid.x += asteroid.dx * elapsedTime;
		asteroid.y += asteroid.dy * elapsedTime;

		
		[asteroid.x, asteroid.y] = WrapCoordinates(asteroid.x, asteroid.y);
	}

	
	for (let bullet of ListBullets)
	{
		bullet.x += bullet.dx * elapsedTime;
		bullet.y += bullet.dy * elapsedTime;

		for (let asteroid of ListAsteroids)
		{
			if (IsPointInsideCircle(asteroid.x, asteroid.y, bullet.x, bullet.y, asteroid.size))
			{
			
				bullet.x = -100;   

				
				Score += 100;

				if (asteroid.size > 20)
				{
				
					let angle1 = Math.random() * 2*Math.PI;
					let angle2 = Math.random() * 2*Math.PI;

				
					ListAsteroids.push(
						new SpaceObject(
							asteroid.x,asteroid.y,
							10 * Math.sin(angle1), 10 * Math.cos(angle1),
							asteroid.size >> 1, 0
						),
						new SpaceObject(
							asteroid.x,asteroid.y,
							10 * Math.sin(angle2), 10 * Math.cos(angle2),
							asteroid.size >> 1, 0
						)
					);
				}
				
				asteroid.x = -100;
			}
		}
	}

	
	for (let asteroid of ListAsteroids)
		if (IsPointInsideCircle(asteroid.x, asteroid.y, Player.x, Player.y, asteroid.size))
			Dead = true;

	
	if (ListBullets.length !== 0)
		ListBullets = ListBullets.filter(function(bullet)
		{
			// if the bullet is not out the screen
			// we just keep it
			return !(bullet.x < 1 || bullet.y < 1 || bullet.x >= sWidth || bullet.y >= sHeight);
		});

	
	if (ListAsteroids.length !== 0)
		ListAsteroids = ListAsteroids.filter(function(asteroid)
		{
			return !(asteroid.x < -1);
		});

	
	if (ListAsteroids.length === 0)
	{
		Score += 1000; 

		ListAsteroids = []; 
		ListBullets = [];	

		ListAsteroids.push(
			new SpaceObject(
				10 * Math.sin(Player.angle - Math.PI / 2),
				10 * Math.cos(Player.angle - Math.PI / 2),
				10 * Math.sin(Player.angle),
				10 * Math.cos(Player.angle),
				80, 0
			),
			new SpaceObject(
				10 * Math.sin(Player.angle + Math.PI / 2),
				10 * Math.cos(Player.angle + Math.PI / 2),
				10 * Math.sin(-Player.angle),
				10 * Math.cos(-Player.angle),
				80, 0
			)
		);
	}
}

function DrawFunc()
{

	DrawWireFrameModel(ShipModel, Player.x,Player.y, Player.angle, Player.size);

	
	for (let asteroid of ListAsteroids)
		DrawWireFrameModel(AsteroidModel, asteroid.x, asteroid.y, asteroid.angle, asteroid.size);

	
	for (let bullet of ListBullets)
		DrawRect(bullet.x,bullet.y);

	
	DrawString(20,50, "SCORE: "+Score, "white", "40px Arial");
}


function SpaceObject(x,y, dx,dy, size, angle)
{
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.size = size;
	this.angle = angle;
}

function WrapCoordinates(x,y)
{
	let _x = x, _y = y;
	if (x < 0) 			_x = x + sWidth;
	if (x >= sWidth) 	_x = x - sWidth;
	if (y < 0)			_y = y + sHeight;
	if (y >= sHeight)	_y = y - sHeight;
	return [_x, _y];
}

function IsPointInsideCircle(cx,cy, x,y, radius)
{
	
	return Math.sqrt((cx - x)*(cx - x) + (cy - y)*(cy - y)) < radius;
}

function DrawWireFrameModel(Coords, x,y, r=0,s=1, color="white")
{ 

	let verts = Coords.length;
	let TransformedCoords = new Array(verts);
	for (let i = 0; i < verts; i++) TransformedCoords[i] = {};

	
	for (let i = 0; i < verts; i++)
	{
		TransformedCoords[i].x = Coords[i].x * Math.cos(r) - Coords[i].y * Math.sin(r);
		TransformedCoords[i].y = Coords[i].x * Math.sin(r) + Coords[i].y * Math.cos(r);
	}

	
	for (let i = 0; i < verts; i++)
	{
		TransformedCoords[i].x = TransformedCoords[i].x * s;
		TransformedCoords[i].y = TransformedCoords[i].y * s;
	}

	
	for (let i = 0; i < verts; i++)
	{
		TransformedCoords[i].x = TransformedCoords[i].x + x;
		TransformedCoords[i].y = TransformedCoords[i].y + y;
	}

	
	for (let i = 0; i < verts; i++)
	{
		let j = (i + 1);
		DrawLine(TransformedCoords[i % verts].x, TransformedCoords[i % verts].y,
				 TransformedCoords[j % verts].x, TransformedCoords[j % verts].y,
				 color);
	}
}

function DrawLine(x1,y1, x2,y2, color)
{
	sContext.strokeStyle = color;
	sContext.beginPath();
	sContext.moveTo(x1,y1);
	sContext.lineTo(x2,y2);
	sContext.stroke();
}

function DrawRect(x,y)
{
	sContext.fillStyle = "white";
	sContext.fillRect( x,y, 2,2 );
}

function DrawString(x,y, string,color,font)
{
	sContext.font = font;
	sContext.fillStyle = color;
	sContext.textAlign = "left";
	let text = string;
	sContext.fillText(text, x,y);
}

function InitResetGame()
{
	
	ListAsteroids = [];
	ListBullets = [];

	
	ListAsteroids.push(new SpaceObject(20,  20,  8,-6, 80, 0));
	ListAsteroids.push(new SpaceObject(100, 20, -5, 3, 80, 0));

	
	Player.x = sWidth/2;
	Player.y = sHeight/2;
	Player.dx = 0;
	Player.dy = 0;
	Player.angle = 0;
	Player.size = 5;

	Dead = false; 
	Score = 0;    
}

function AddEventsListeners()
{
	document.addEventListener("keydown", function(e)
	{
		Keys[e.key] = true;
		if (e.key === SPACE)
			Keys.SKey = true;
	});
	document.addEventListener("keyup", function(e)
	{
		Keys[e.key] = false;
		if (e.key === SPACE)
		{
			Keys.SKey = false;
			HOLD = false;
		}
	});
}