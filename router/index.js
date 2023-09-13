//Bu kod, Express.js kullanarak oluşturulan bir API'nin rotalarını ve ilgili orta yazılım (middleware) işlemlerini tanımlar. İşte bu kodun ayrıntılı açıklamaları:

//İlk olarak, gerekli modülleri ve dosyaları içe aktarıyoruz:
const userController = require('../controllers/user-controller');  // Kullanıcı işlemlerini yöneten controller'ı içeri aktarır.
const authMiddleware = require("../middlewares/auth-middleware")  // Oturum kontrolü için kullanılacak middleware'i içeri aktarır.  
const Router = require('express').Router; // Express'in Router sınıfını içeri aktarır.

const router = new Router(); // Yeni bir Router örneği oluşturur.
const {body} = require("express-validator"); // Gelen verileri doğrulamak için kullanılacak express-validator'ı içeri aktarır.

//Ardından, rotaları ve bu rotalara uygulanacak middleware işlemlerini tanımlarız:
//a. /registration POST rotası, kullanıcı kaydı için kullanılır. body fonksiyonu ile gelen e-posta ve şifre verilerinin doğrulama kuralları belirlenir ve bu verileri doğrulamadan sonra userController.registration işlevine yönlendirilir.
router.post('/registration', 
body('email').isEmail(),
body('password').isLength({min: 3, max:32}),
userController.registration);

//b. /login POST rotası, kullanıcı girişi için kullanılır ve doğrudan userController.login işlevine yönlendirilir.
router.post('/login', userController.login);

//c. /logout POST rotası, kullanıcı oturumunu sonlandırmak için kullanılır ve userController.logout işlevine yönlendirilir.
router.post('/logout', userController.logout);

//d. /activate/:link GET rotası, kullanıcı hesabını aktivasyon bağlantısı üzerinden etkinleştirmek için kullanılır ve userController.activate işlevine yönlendirilir.
router.get('/activate/:link', userController.activate);

//e. /refresh GET rotası, yeniden açılabilir (refresh) token kullanarak oturumu yenilemek için kullanılır ve doğrudan userController.refresh işlevine yönlendirilir.
router.get('/refresh', userController.refresh);

//f. /users GET rotası, tüm kullanıcıları getirmek için kullanılır ve önce authMiddleware adlı orta yazılım ile oturum kontrolü yapılır. 
//Oturum geçerliyse, isteği işlemek için userController.getUsers işlevine yönlendirilir.
router.get('/users',authMiddleware, userController.getUsers);


//Son olarak, bu router'ı dışa aktarırız ki Express uygulamanız bu rotaları kullanabilsin:
 module.exports = router

 //Bu kod, kullanıcıların kaydını yapabilmesi, giriş yapabilmesi, oturumu sonlandırabilmesi, hesabını etkinleştirebilmesi, oturumu yenileyebilmesi ve tüm kullanıcıları getirebilmesi için gerekli olan Express.
 //js API rotalarını ve bu rotalara uygulanacak doğrulama işlemlerini (middleware) tanımlar. Bu rotalar, kullanıcı işlemlerini yöneten bir controller ile ilişkilendirilmiştir.