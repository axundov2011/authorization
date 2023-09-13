// besinci islem islem islem
//İlk olarak, gerekli modülleri içe aktarıyoruz:
const jwt  = require("jsonwebtoken");   // JSON Web Token işlemleri için kullanılır.
const tokenModel = require("../modals/token-model"); // Token modelini içeri aktarır.

//TokenService sınıfını oluşturuyoruz ve bu sınıf içinde kullanılacak token işlemlerini gerçekleştiren fonksiyonları tanımlıyoruz:
class TokenService {

  //a. generateToken fonksiyonu, verilen payload (veri) üzerinden erişim ve yeniden açılabilir (refresh) tokenler oluşturur. Bu tokenler, process.env.JWT_ACCESS_SECRET ve process.env.JWT_REFRESH_SECRET ile belirtilen gizli anahtarlarla imzalanır.
  // Erişim tokeni 30 saniye (örneğin, kısa ömürlü) ve yeniden açılabilir token 30 gün (örneğin, uzun ömürlü) süreyle geçerlidir. Bu tokenleri bir nesne olarak döndürür.
  generateToken(payload){
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30s'})
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
    return {
        accessToken,
        refreshToken
    }    
  }

  // b. validateAccessToken fonksiyonu, verilen erişim tokenini doğrular. 
  //Token geçerliyse, içindeki kullanıcı verilerini döndürür. Geçerli değilse null döndürür.
  validateAccessToken(token){
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null; 
    }
  }

  //c. validateRefreshToken fonksiyonu, verilen yeniden açılabilir (refresh) tokeni doğrular. 
  //Token geçerliyse, içindeki kullanıcı verilerini döndürür. Geçerli değilse null döndürür.
  validateRefreshToken(token){
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }


  //d. saveToken fonksiyonu, kullanıcı kimliği (userId) ve yeniden açılabilir (refresh) token verisini alır. Bu fonksiyon, veritabanında kullanıcı için bir token kaydı bulunup bulunmadığını kontrol eder. 
  //Eğer kullanıcı için bir kayıt varsa, mevcut yeniden açılabilir tokeni günceller ve güncellenmiş veriyi döndürür. Aksi halde, yeni bir token kaydı oluşturur ve kaydı döndürür.
  async saveToken(userId, refreshToken){
    const tokenData = await tokenModel.findOne({user:userId})
    if(tokenData){
        tokenData.refreshToken = refreshToken;
        return tokenData.save();
    }
    const token = await tokenModel.create({user:userId, refreshToken})
    return token;
  }

  //e. removeToken fonksiyonu, verilen yeniden açılabilir (refresh) tokeni veritabanından siler.
  async removeToken(refreshToken){
    const tokenData = await tokenModel.deleteOne({refreshToken})
    return tokenData;
   }

   //f. findToken fonksiyonu, verilen yeniden açılabilir (refresh) tokeni veritabanında bulur ve kaydı döndürür.
  async findToken(refreshToken){
    const tokenData = await tokenModel.findOne({refreshToken})
    return tokenData;
   }


}


//Son olarak, TokenService sınıfını dışa aktarıyoruz ki başka dosyalardan bu sınıfa erişilebilsin.
module.exports = new TokenService();

//Bu kod, JSON Web Token (JWT) tabanlı oturum yönetimi için kullanılan bir servis sınıfını temsil eder. Bu sınıf, kullanıcının oturumunu yönetmek ve erişim ve yeniden açılabilir tokenler oluşturmak için kullanılır. 
//Bu tokenler, kullanıcının kimliğini doğrulamak ve güvenli bir şekilde oturumları sürdürmek için kullanılır.