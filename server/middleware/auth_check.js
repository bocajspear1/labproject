exports.run = function(){

  return function(req, res, next){
	
    if (req.session)
		{
			if (req.session.authenticated && req.session.authenticated !== false)
				{
					next();
				}else{
					
					res(false);
				}
		}else{
			
			res(false);
		}
     
  }

}
