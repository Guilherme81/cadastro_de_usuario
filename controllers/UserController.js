var User = require("../models/User");
var PasswordToken = require("../models/passwordToken");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

var secret = "27c87c428b39847c28b747247nccbjh838234"


class UserController {
    async index (req, res){ 
      var users = await User.findAll();
      res.json(users);
    };
    
    async findUser(req, res){
        var id = req.params.id;
        var user = await User.findById(id);

        if (user == undefined) {
            res.status(404);
            res.json({err: "Usuário não encontrado!"});
        } else {
            res.json(user);
        }

    } 

    async create(req, res){
        var {email, name, password} = req.body;

        if(email == undefined){ 
           res.status(400);
           res.json({err: "o e-mail é inválido"}); 
           return;          
        }

        if (name == undefined) {
            res.status(400);
            res.json({err: "o nome é inválido"}); 
            return;  
        }
        
        if (password == undefined) {
            res.status(400);
            res.json({err: "a senha é inválido"}); 
            return;  
        }

        var emailExists = await User.findEmail(email);

        if (emailExists) {
            res.status(406);
            res.json({err: "O e-mail já está cadastrado!"});
            return;
        }   

        await User.new(email,password,name);
        res.send("Tudo Ok!");
    };

    async edit(req, res){
        var {id, name, role, email} = req.body;
        var result = await User.update(id,email,name,role);
        if(result != undefined){
            if(result.status){
                res.send("Tudo OK!");
            }else{
                res.status(406);
                res.send(result.err)
            }
        }else{
            res.status(406);
            res.send("Ocorreu um erro no servidor!");
        }
    }

    async remove(req, res){
        var id = req.params.id;

        var result = await User.delete(id);

        if(result.status){
            res.send("Tudo OK!");
        }else{
            res.status(406);
            res.send(result.err);
        }
    }

    async recoverPassword(req, res) {
        var email = req.body.email;  
        var result = await PasswordToken.create(email);

        if (result.status) {
            res.send("" + result.token);
        } else {
            res.status(406);
            res.send(result.err);
        }
    }  

    async changePassword(req, res){
        var token = req.body.token;
        var password = req.body.password;
        var isTokenValid = await PasswordToken.validate(token);
        if(isTokenValid.status){
            await PasswordToken.changePassword(password,isTokenValid.token.user_id,isTokenValid.token.token);
            res.send("Senha alterada");
        }else{
            res.status(406);
            res.send("Token inválido!");
        }
    }

    async login(req, res){
        var {email, password} = req.body;

        var user = await User.findByEmail(email);

        if (user != undefined) {
            
           var result = await bcrypt.compare(password, user.password);

          if (result) {
              var token = jwt.sign({ email: user.email, role: user.role }, secret);

              res.json({token: token});

          } else {
              res.status(406);
              res.send("Senha incorreta");
          }
        } else {
            res.json({status: false});
        }  

    }  

}

module.exports = new UserController();