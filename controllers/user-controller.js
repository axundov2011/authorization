//birinci islem
//İlk olarak, gerekli modülleri içe aktarıyoruz. Bu modüller, projenizin farklı bölümlerinde kullanılacak olan işlevleri sağlar.

//ApiError: Bu modül, özel hata nesneleri oluşturmanıza yardımcı olur ve HTTP hata kodlarına uygun hata yanıtları oluşturmanıza izin verir.
const ApiError = require("../exceptions/api-error");

//userService: Bu modül, kullanıcı işlemleri için bir servis sağlar ve bu servis üzerinden kullanıcı kayıt, giriş, vb. işlemleri gerçekleştirir.
const userService = require("../service/user-service");

//validationResult: Bu, gelen isteklerin doğrulama sonuçlarını kontrol etmenizi ve gerektiğinde hata yanıtları oluşturmanızı sağlar. Express uygulamanızda gelen verilerin doğruluğunu kontrol etmek için kullanılır.
const {validationResult} = require("express-validator")


//UserController sınıfını oluşturuyoruz ve bu sınıfın içinde farklı işlevler tanımlıyoruz:
class UserController {

//a. registration işlevi, kullanıcı kaydı için kullanılır. İlk olarak, gelen isteğin doğruluğunu kontrol ederiz. Eğer hatalı bir istekse, ApiError.BadRequest ile bir hata yanıtı döneriz. 
//Ardından, gelen e-posta ve şifre bilgilerini alırız ve userService kullanarak kullanıcı kaydını gerçekleştiririz. 
//Son olarak, bir çerez oluşturarak oturum yönetimini sağlarız ve kullanıcı verilerini JSON yanıt olarak döneriz.
async registration(req, res, next ) {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return next(ApiError.BadRequest('doğrulama xətası', errors.array()))
        }
        const {email, password} = req.body;
        
        const userData = await userService.registration(email, password);
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}) //httpOnly ona görə true edirik ki browserin içinde dəyişilə bilməsin

        return res.json(userData); 
    } catch (e) {
        next(e)
    }
}

//b. login işlevi, kullanıcı girişi için kullanılır. Giriş bilgilerini alırız ve userService kullanarak kullanıcı girişini gerçekleştiririz. 
//Oturum çerezi oluşturarak kullanıcıyı oturumlandırırız ve kullanıcı verilerini JSON yanıt olarak döneriz.
async login(req, res, next ) {
    try {
        
     const {email, password} = req.body;
     const userData = await userService.login(email, password);
     res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}) //httpOnly ona görə true edirik ki browserin içinde dəyişilə bilməsin

     return res.json(userData); 
    } catch (e) {
        next(e) 
    }
}

//c. logout işlevi, kullanıcı oturumunu sonlandırmak için kullanılır. Oturum çerezini temizleriz ve sonlandırma işleminin sonucunu JSON yanıt olarak döneriz.
async logout(req, res, next ) {
    try {
        const {refreshToken} = req.cookies;
        const token = await userService.logout(refreshToken);
        res.clearCookie('refreshToken');
        return res.json(token);
    } catch (e) {
        next(e)
    }
}

//d. activate işlevi, kullanıcı hesabını aktive etmek için kullanılır. Aktivasyon bağlantısını parametre olarak alır ve userService kullanarak kullanıcı hesabını aktifleştiririz. Ardından, kullanıcıyı istediğiniz bir URL'ye yönlendiririz.
async activate(req, res, next ) {
    try {
        const activationLink = req.params.link;
        await userService.activate(activationLink)
        return res.redirect(process.env.CLIENT_URL)
    } catch (e) {
        next(e)
    }
}

//e. refresh işlevi, oturumun yeniden açılması için kullanılır. Oturum çerezini kullanarak userService ile oturumu yenileriz ve kullanıcı verilerini JSON yanıt olarak döneriz.
async refresh (req, res, next ) {
    try {
    const {refreshToken} = req.cookies;
    const userData = await userService.refresh(refreshToken)
    res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true}) //httpOnly ona görə true edirik ki browserin içinde dəyişilə bilməsin

    return res.json(userData); 
    } catch (e) {
     next(e)   
    }
}

//f. getUsers işlevi, tüm kullanıcıları getirmek için kullanılır. userService kullanarak tüm kullanıcıları alır ve JSON yanıt olarak döneriz.
async getUsers (req, res, next ) {
    try {
        const users  = await userService.getAllUsers();
        return res.json(users)
    } catch (e) {
        next(e)
    }
}
}

//Son olarak, UserController sınıfını dışa aktarıyoruz ki başka dosyalardan bu sınıfa erişilebilsin.
module.exports = new UserController();

//Bu kod, kullanıcı kimlik doğrulaması, kayıt, giriş, oturum yönetimi ve kullanıcı verilerinin alınması gibi temel kullanıcı yönetimi işlevlerini sağlayan bir Node.js uygulamasının kontrolör katmanını temsil eder. 
//Bu kodun kullanıcıları yöneten bir web uygulamasının bir parçası olarak kullanıldığını varsayabiliriz.