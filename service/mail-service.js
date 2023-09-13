//İlk olarak, gerekli modülü içe aktarıyoruz:
const nodemailer =  require("nodemailer"); // E-posta gönderme işlemleri için kullanılan nodemailer modülünü içeri aktarırız.

//MailService sınıfını oluşturuyoruz ve bu sınıfın yapıcı (constructor) fonksiyonunda bir e-posta taşıyıcı (transporter) oluşturuyoruz:
class MailService { 
    constructor(){
          this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,  // E-posta sunucusunun host adresi
            posrt: process.env.SMTP_PORT, // E-posta sunucusunun port numarası
            secure: false, // Güvenli bağlantı kullanılacak mı?
            auth: {
              user: process.env.SMTP_USER, // E-posta gönderme için kullanılacak kullanıcı adı
              pass: process.env.SMTP_PASSWORD // E-posta gönderme için kullanılacak şifre
            }
          })
    }
     //this.transporter: E-postaları göndermek için kullanılacak nodemailer taşıyıcısını oluşturuyoruz. 
     //Taşıyıcı, e-posta sunucusuna bağlanmak ve e-postaları iletmek için gerekli ayarları içerir. 
  //Bu ayarlar, projenizin çevresel değişkenlerinden (environment variables) alınır.
  //
  //sendActivationMail fonksiyonu, aktivasyon e-postasını göndermek için kullanılır. 
  //Bu fonksiyon, alıcı e-posta adresini ve aktivasyon bağlantısını alır:
async sendActivationMail(to, link){
 //this.transporter.sendMail: Nodemailer ile e-posta gönderme işlemini gerçekleştirir. 
 //Gönderilen e-postanın konusunu, alıcısını, gönderenini, HTML içeriğini ve daha fazlasını içeren bir e-posta nesnesi oluştururuz.
    await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'hesabın aktivləşdirilməsi ' + process.env.API_URL,
        text: '',
        html: 
        `
          <div>
            <h1>Aktivləşdirmək üçün linkə daxil olun</h1>
            <a href="${link}">${link}</a>
          </div>
        `,  // E-posta içeriği (HTML formatında)
    })
      
}
}

//Son olarak, MailService sınıfını dışa aktarıyoruz ki başka dosyalardan bu sınıfa erişilebilsin:
module.exports = new MailService();

//Bu kod, e-posta gönderme işlemleri için kullanılan bir servis sınıfını temsil eder. E-posta taşıyıcısı, çevresel değişkenlerde belirtilen SMTP sunucusuna bağlanarak e-posta gönderme işlemini gerçekleştirir. 
//Bu, kullanıcı aktivasyonu gibi senaryolarda e-posta göndermek için kullanılabilir.