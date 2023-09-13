// Bu endPoint qeydiyyatdan kecmis istifadecileri ceke biler
const ApiError = require("../exceptions/api-error")
const tokenService = require("../service/token-service")
module.exports = function (req, res, next){
try {
    const authorizationHeader = req.headers.authorization;
    if(!authorizationHeader){
        return next(ApiError.UnauthorizadError());
    }
    const accessToken = authorizationHeader.split(' ')[1];
    if(!accessToken){
        return next(ApiError.UnauthorizadError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if(!userData){
        return next(ApiError.UnauthorizadError());
    }

    req.user = userData;
    next();
} catch (e) {
    return next(ApiError.UnauthorizadError( ))
}
};