const K = ['tagline','cta','radar','triage','builder','free','pro','learn','copy','all','websites','apps','ai','launch','buy','cert'];
const R = {
 en:'Cyber Security Engineer|Join WhatsApp Channel|Threat Radar|Quick Triage|Command Builder|Free Arsenal|Pro Store|Learning Roadmaps|Copy|All|Websites|Apps|AI Tools|Launch / Download|Buy Now via WhatsApp|Get Certificate',
 ar:'مهندس أمن سيبراني|انضم لقناة واتساب|رادار التهديدات|فحص سريع|منشئ الأوامر|الترسانة المجانية|المتجر الاحترافي|مسارات التعلم|نسخ|الكل|مواقع|تطبيقات|أدوات ذكاء اصطناعي|تشغيل / تحميل|اشترِ عبر واتساب|احصل على الشهادة',
 fr:'Ingénieur Cybersécurité|Rejoindre la chaîne WhatsApp|Radar des menaces|Triage rapide|Générateur de commandes|Arsenal gratuit|Boutique Pro|Parcours d\'apprentissage|Copier|Tout|Sites web|Applications|Outils IA|Lancer / Télécharger|Acheter via WhatsApp|Obtenir le certificat',
 de:'Cybersicherheits-Ingenieur|WhatsApp-Kanal beitreten|Bedrohungsradar|Schnelle Triage|Befehlsgenerator|Kostenloses Arsenal|Pro-Shop|Lernpfade|Kopieren|Alle|Websites|Apps|KI-Tools|Starten / Herunterladen|Über WhatsApp kaufen|Zertifikat erhalten',
 es:'Ingeniero de Ciberseguridad|Unirse al canal de WhatsApp|Radar de amenazas|Triaje rápido|Generador de comandos|Arsenal gratuito|Tienda Pro|Rutas de aprendizaje|Copiar|Todo|Sitios web|Aplicaciones|Herramientas IA|Abrir / Descargar|Comprar por WhatsApp|Obtener certificado',
 ru:'Инженер по кибербезопасности|Канал WhatsApp|Радар угроз|Быстрый анализ|Конструктор команд|Бесплатный арсенал|Pro-магазин|Планы обучения|Копировать|Все|Сайты|Приложения|ИИ-инструменты|Открыть / Скачать|Купить через WhatsApp|Получить сертификат',
 zh:'网络安全工程师|加入WhatsApp频道|威胁雷达|快速分析|命令生成器|免费工具库|专业商店|学习路线|复制|全部|网站|应用|AI工具|打开 / 下载|通过WhatsApp购买|获取证书',
 ja:'サイバーセキュリティエンジニア|WhatsAppチャンネルに参加|脅威レーダー|クイックトリアージ|コマンドビルダー|無料ツール|プロストア|学習ロードマップ|コピー|すべて|サイト|アプリ|AIツール|開く / ダウンロード|WhatsAppで購入|証明書を取得',
 ko:'사이버 보안 엔지니어|WhatsApp 채널 참여|위협 레이더|빠른 분석|명령 생성기|무료 도구|프로 스토어|학습 로드맵|복사|전체|웹사이트|앱|AI 도구|실행 / 다운로드|WhatsApp으로 구매|인증서 받기'
};
export const I18N = Object.fromEntries(Object.entries(R).map(([l, s]) => [l, Object.fromEntries(s.split('|').map((v, i) => [K[i], v]))]));
export const t = k => (I18N[localStorage.getItem('m3_lang') || 'en'] || I18N.en)[k] || I18N.en[k] || k;
export function applyLang(l) {
  if (!I18N[l]) l = 'en';
  localStorage.setItem('m3_lang', l);
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = I18N[l][e.dataset.i18n] || I18N.en[e.dataset.i18n]; });
}
