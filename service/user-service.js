//ikinci işləm
//İlk olarak, gerekli modülleri içe aktarıyoruz ve kullanacağımız diğer bileşenleri getiriyoruz:
const UserModel = require("../modals/user-model"); // Kullanıcı modelini içeri aktarır.
const bcrypt = require('bcrypt');// Şifreleme işlemleri için bcrypt'i içeri aktarır.
const uuid = require("uuid");// UUID oluşturmak için kullanılır.
const mailService = require("./mail-service"); // E-posta hizmetini içeri aktarır.
const tokenService = require("./token-service"); // Token hizmetini içeri aktarır.
const UserDto  = require("../dtos/user-dto"); // Kullanıcı verilerini taşıyan DTO'yu içeri aktarır.
const ApiError = require("../exceptions/api-error"); // Özel hata nesneleri için ApiError'ı içeri aktarır.
const tokenModel = require("../modals/token-model"); // Token modelini içeri aktarır.

//UserService sınıfını oluşturuyoruz ve bu sınıf içinde kullanıcı kayıt, aktivasyon, giriş, oturum yönetimi ve diğer kullanıcı işlemleri için fonksiyonları tanımlıyoruz.
class UserService {


  //a. registration fonksiyonu, yeni kullanıcı kaydı oluşturur. Öncelikle veritabanında aynı e-posta adresiyle kayıtlı bir kullanıcının olup olmadığını kontrol ederiz. Eğer varsa, bir hata döneriz. 
  //Ardından, şifreyi bcrypt kullanarak şifreleriz, aktivasyon bağlantısı için bir UUID oluştururuz ve kullanıcı modelini veritabanına kaydederiz. Kullanıcı verilerini bir DTO'ya dönüştürürüz ve kullanıcıya JWT (JSON Web Token) üreterek döneriz.
 async registration(email, passowrd){
    const candidate = await UserModel.findOne({email})
    if(candidate){
        throw ApiError.BadRequest(`Bu email adresi ${email} artıq mövcuddur`)
    }
    const hashPassword = await bcrypt.hash(passowrd, 3);
    const activationLink = await uuid.v4();// v34fa-asfasf-142saf-sa-asf belə olacaq hardasa.
    const user = await UserModel.create({email, password: hashPassword, activationLink});
    // await mailService.sendActivationMail(email,   `${process.env.API_URL}/api/activate/${activationLink}`);

    const userDto = new UserDto(user); //id, email, isActivated
    const tokens  = tokenService.generateToken({...userDto}); 
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return {...tokens, use: userDto}
 }

 //b. activate fonksiyonu, aktivasyon bağlantısını kullanarak kullanıcı hesabını etkinleştirir.
 async activate(activationLink){
   const user = await UserModel.findOne({activationLink})
   if(!user){
    throw ApiError.BadRequest('Düzgün link seçilməyib aktivləşdirmək üçün ')
   }
   user.isActivated = true;
   await user.save()
 }

 //c. login fonksiyonu, kullanıcı girişi yapar. Veritabanında kullanıcının varlığını ve şifre uygunluğunu kontrol eder, ardından kullanıcıyı oturumlandırır ve JWT üreterek döner.
 async login(email, passowrd){
    const user = await UserModel.findOne({email})
    if(!user){
      throw ApiError.BadRequest('Bu e-poçtda  olan istifadəçilər tapılmadı')
    }
    const isPassEquals = await bcrypt.compare(passowrd, user.password);
   if(!isPassEquals){
    throw ApiError.BadRequest('Yanlış şifrə daxil ettiniz!');
   }
   const userDto = new UserDto(user);
   const tokens = tokenService.generateToken({...userDto});

   await tokenService.saveToken(userDto.id, tokens.refreshToken);
   return {...tokens, user: userDto}
 }

 // d. logout fonksiyonu, verilen yeniden açılabilir (refresh) JWT'yi kullanarak kullanıcı oturumunu sonlandırır.
 async logout(refreshToken){
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }
  

  //e. refresh fonksiyonu, yeniden açılabilir (refresh) JWT'yi kullanarak oturumu yeniler. 
  //Geçerli bir yeniden açılabilir JWT ve veritabanında kayıtlı bir token varsa, kullanıcıyı oturumlandırır ve yeni bir JWT üreterek döner.
  async refresh(refreshToken){
    if(!refreshToken){
      throw ApiError.UnauthorizadError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenfromDb  = await tokenService.findToken(refreshToken)
    if(!userData || !tokenfromDb){
      throw ApiError.UnauthorizadError()
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
   const tokens = tokenService.generateToken({...userDto});

   await tokenService.saveToken(userDto.id, tokens.refreshToken);
   return {...tokens, user: userDto}
  }


  // f. getAllUsers fonksiyonu, tüm kayıtlı kullanıcıları veritabanından çeker ve döner.
  async getAllUsers(){
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();