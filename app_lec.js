var app = require('./config/mysql/express')();//함수니까 ()도 쓰는게 정석
var passport = require('./config/mysql/passport')(app);
var static = require('serve-static');
var path = require('path');
var cors = require('cors');//다중접속을 위한 cors 추가
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');//add autoInc
var fs = require('fs');//메뉴를 JSON파일로 바꿔주기 위한 모듈 불러옴
var jsonfile = require('jsonfile');
var mysql = require('mysql');
app.use(cors());
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));

var pool=mysql.createPool({
	host:"localhost",//0.0.0.0
	user:"root",//root
	password:"111111",//ari610
	database:"o2"//o2
});
var CafeteriaModel;

var auth = require('./routes/mysql/auth')(passport);
app.use('/auth', auth);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/welcome', function(req, res){
	if(req.user.username == "food"){
		res.sendFile(path.join(__dirname + '/public/adminFood.html'));
	}else if(req.user.username == "phone"){
		res.sendFile(path.join(__dirname + '/public/adminPhone.html'));
	}
});

app.get('/lecture', function(req, res){
  res.sendFile(__dirname + '/public/lecture.html');
});

app.get("/lecutre/list", function(req, res){
  pool.getConnection(function(error, con){
    if(error){
      console.log(error);
    }else{
      var sql="select * from lecture2 order by number asc";//오름차순으로 보여줄거야

      con.query(sql, function(err, result){
        if(err){
          console.log(err);//심각한 에러, 해줄 수 있는 게 없다.
        }else{//오류가 안 난 경우...오류가 없다고 하여 수정이 완료되었다고 단정하면 안 된다.
					const file = './uploads/LecList.json'
					const list = result;

					jsonfile.writeFile(file, {list}, function(err){
						if(err) console.log(err);
					});
					if(err){
						console.log(err);
					} else {
          res.writeHead(200, {"Content-Type":"text/html"});
          res.end(JSON.stringify(result));
        	}
				}
        con.release();
			});
		}
	});
});

app.get('/food/admin', function(req, res){
	res.sendFile(path.join(__dirname + '/public/adminFood.html'));
});
//메뉴 추가 라우터
app.post("/food/add", function(req, res){
	console.log('/food/add 호출되었음.');

	var paramDate = req.body.date;
	var paramPart = req.body.part;
	var paramMenu = req.body.menu;

	addFood(paramDate, paramPart, paramMenu);
	console.log('Add Food Success!');
});
////메뉴 추가 함수
function addFood(paramDate, paramPart, paramMenu){
		var cafeteria;

		cafeteria = new CafeteriaModel({
				'date':paramDate,
				'part':paramPart,
				'menu':paramMenu
		});

		cafeteria.save(function(err) {
			if (err) {
				console.log(err);
			}
			console.log(paramDate+ ', '+paramPart+ ', '+ paramMenu+ 'document 추가되었습니다.');
		});
}
////메뉴 읽기
app.get("/food/list", function(req, res){
	console.log('/food/list 호출되었음.');
	listFood(req, res);
	console.log('List Food Success');
});
//메뉴 읽기 함수
function listFood(req, res) {
	CafeteriaModel.find({}, function(err, cafeterias){
		console.log('cafeterias.length: '+cafeterias.length);

		const file = './uploads/MenuList.json'
		const list = cafeterias;

		jsonfile.writeFile(file, {list}, function(err){
			if(err) console.log(err);
		});
		if (err) {
			callback(err, null);
			return;
		} else {
			res.writeHead(200, {"Content-Type":"text/html"});
			res.end(JSON.stringify(cafeterias));
		}
	});
}
////메뉴 삭제
app.post("/food/del", function(req, res){
	var paramNum = req.body.number;

	CafeteriaModel.findOneAndDelete({
		'number': paramNum
		}, function(err, cafeterias){
			if(err) {
				console.log(err);
			} else {
				console.log(paramNum+'번 document가 삭제되었습니다.');
			}
	});
});
//메뉴 전체 삭제
app.post("/food/delAll", function(req, res){
	CafeteriaModel.deleteMany({}, function(err, cafeterias){
			if(err) {
				console.err(err);
			} else {
				console.log('document가 전체 삭제되었습니다.');
			}
	});
});

// 교내전화번호
app.get('/phone/admin', function(req, res){
	res.sendFile(path.join(__dirname + '/public/adminPhone.html'));
});

//메뉴 추가 라우터
app.post("/phone/add", function(req, res){
	console.log('/phone/add 호출되었음.');

	var paramDepartment = req.body.department;
	var paramLocation = req.body.location;
	var paramPosition = req.body.position;
	var paramPhone = req.body.phone;

	addPhone(paramDepartment, paramLocation, paramPosition, paramPhone );
	console.log('Add Phone Success!');
});
////메뉴 추가 함수
function addPhone(paramDepartment, paramLocation, paramPosition, paramPhone){
		var phone;

		phone = new PhoneModel({
				department : paramDepartment,
				location : paramLocation,
				position : paramPosition,
				phone : paramPhone
		});

		phone.save(function(err) {
			if (err) {
				console.log(err);
			}
			console.log(paramDepartment+ ', '+paramLocation+ ', '+ paramPosition+ ',' + paramPhone + 'document 추가되었습니다.');
		});
}
////메뉴 읽기
app.get("/phone/list", function(req, res){
	console.log('/phone/list 호출되었음.');
	listPhone(req, res);
	console.log('List Phone Success');
});
//메뉴 읽기 함수
function listPhone(req, res) {
	PhoneModel.find({}, function(err, phones){
		console.log('phones.length: '+phones.length);

		const file = './uploads/PhoneList.json'
		const list = phones;

		jsonfile.writeFile(file, {list}, function(err){
			if(err) console.log(err);
		});
		if (err) {
			callback(err, null);
			return;
		} else {
			res.writeHead(200, {"Content-Type":"text/html"});
			res.end(JSON.stringify(phones));
		}
	});
}
////메뉴 삭제
app.post("/phone/del", function(req, res){
	var paramNum = req.body.number;

	PhoneModel.findOneAndDelete({
		'number': paramNum
		}, function(err, phones){
			if(err) {
				console.log(err);
			} else {
				console.log(paramNum+'번 document가 삭제되었습니다.');
			}
	});
});
//메뉴 전체 삭제
app.post("/phone/delAll", function(req, res){
	PhoneModel.deleteMany({}, function(err, phones){
			if(err) {
				console.err(err);
			} else {
				console.log('document가 전체 삭제되었습니다.');
			}
	});
});


// 몽구스 연결
function connectDB() {
  var databaseUrl = 'mongodb://localhost:27017/local';

  console.log('데이터베이스 연결을 시도합니다.');
  mongoose.Promise = global.Promise;
  mongoose.connect(databaseUrl,
    {
      useNewUrlParser: true,
      poolSize: 10
    }
  );
  database = mongoose.connection;
  autoIncrement.initialize(database);//add autoInc

  database.on('error', console.error.bind(console, 'mongoose connection error.'));
  database.on('open', function () {
    console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);

    createCafeteriaSchema(); //급식스키마생성
		createPhoneSchema(); //교내전화번호스키마생성
  });

  database.on('disconnected', function() {
    console.log('연결이 끊어졌습니다. 5초 후 재연결합니다.');
    setInterval(connectDB, 5000);
  });
}

function createCafeteriaSchema() {

  var CafeteriaSchema = new Schema({
    number: {type: Number},
    date: {type: Number},
    part: {type: String, default: ''},
    menu: {type: String, default: ''}
  });
  console.log('CafeteriaSchema 정의되었음');

	CafeteriaSchema.plugin(autoIncrement.plugin, {model: 'Cafeteria', field: 'number'});//add autoInc
  CafeteriaModel = mongoose.model('Cafeteria', CafeteriaSchema);

  console.log('CafeteriaModel 정의되었음');
}

function createPhoneSchema(){
	var PhoneSchema = new Schema({
		number: {type: Number},
		department: {type:String},
		location: {type: String},
		position: {type: String, default: ''},
		phone: {type: String, default: ''}
	});
	console.log('PhoneSchema 정의되었음');

	PhoneSchema.plugin(autoIncrement.plugin, {model: 'Phone', field: 'number'});//add autoInc
	PhoneModel = mongoose.model('Phone', PhoneSchema);

	console.log('PhoneModel 정의되었음');
}

app.listen(3003, function(){
	console.log('Connected 3003 port!!!');
	connectDB();
});
