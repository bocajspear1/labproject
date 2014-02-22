

exports.actions = function(req, res, ss){

  // Load session data into req.session 
  req.use('session');

  return {

    authenticate: function(username,password){
		res({'AUTH':'SUCCESS'});
    }

  }
}
 
