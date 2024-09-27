import { assets } from "../../lib/constants"
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations("Home")
  return (
    <main className="w-full bg-[#EEECFB]">
      <section className="flex justify-center items-center py-16">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-6xl md:text-6xl font-semibold text-gray-900 mb-8">{t("title")}</h1>
          <p className="text-[29px] text-gray-900 mb-8">{t.rich("desc", {
            br: () => <br />
          })}
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src={assets.QR} alt="QR Code" className="w-12 h-12" />
              <span className="text-gray-600">{t("qr_text")}</span>
            </div>
          </div>
        </div>
        <div className="flex self-end items-center flex-col">
          <div className="relative mb-2.5">
            <video className="w-[278px] h-[579px]" src="https://assets-cms.kraken.com/files/51n36hrp/facade/514d4a19b477dec279e57a3188b49aec83c92c17.mp4" autoPlay loop playsInline muted  >
            </video>
          </div>
        </div>
      </section>
      {/* Stats Section */}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-normal text-center mb-8">
            {t("state_section_title")}
          </h2>
          <div className="flex flex-wrap justify-center gap-64">
            <div className="text-center">
              <p className="text-5xl font-medium mb-3">{t("client_number")}</p>
              <p className="text-gray-900 font-medium">{t("client_text")}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-medium mb-3">{t("country_number")}</p>
              <p className="text-gray-900 font-medium">{t("country_text")}</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-medium mb-3">{t("trade_volume_number")}</p>
              <p className="text-gray-900 font-medium">{t("trade_volume_text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Buy Crypto Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img src="./stats.webp" alt="Kraken platform" className="w-full h-auto rounded-lg shadow-lg" />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h3 className="text-xl text-gray-600 mb-2">{t("crypto_section_header")}</h3>
              <h2 className="text-4xl font-medium mb-6">{t("crypto_section_title")}</h2>
              <ol className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="border-2 border-purple-600 text-purple-600 text-xl rounded-full w-9 h-9 flex items-center justify-center mr-4">{t("crypto_buy_instruction_1_number")}</span>
                  <span className="text-xl text-gray-800">{t("crypto_buy_instruction_1_text")}</span>
                </li>
                <li className="flex items-center">
                  <span className="border-2 border-purple-600 text-purple-600 text-xl rounded-full w-9 h-9 flex items-center justify-center mr-4">{t("crypto_buy_instruction_2_number")}</span>
                  <span className="text-xl text-gray-800">{t("crypto_buy_instruction_2_text")}</span>
                </li>
                <li className="flex items-center">
                  <span className="border-2 border-purple-600 text-purple-600 text-xl rounded-full w-9 h-9 flex items-center justify-center mr-4">{t("crypto_buy_instruction_3_number")}</span>
                  <span className="text-xl text-gray-800">{t("crypto_buy_instruction_3_text")}</span>
                </li>
              </ol>
              <button className="bg-purple-600 text-white font-medium px-6 py-3 rounded-full hover:bg-purple-700">
                {t("crypto_buy_button")}
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Why Kraken */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-medium text-center mb-12">{t("whyKraken_section_title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Feature
              img={
                <img src="./simplicity.webp" alt="Simplicity" className="w-44 h-44" />
              }
              title={t("whyKraken_section_simplicity_title")}
              description={
                <>
                  {t("whyKraken_section_simplicity_desc")}
                  <span className="text-purple-600">{t("whyKraken_section_simplicity_span")}</span>.
                </>
              }
            />
            <Feature
              img={
                <img src="./magnify.webp" alt="Education" className="w-44 h-44" />
              }
              title={t("whyKraken_section_education_title")}
              description={
                <>
                  <span> {t("whyKraken_section_education_desc1")}</span>
                  <span className="text-purple-600">{t("whyKraken_section_education_span")}</span>
                  <span>{t("whyKraken_section_education_desc2")}</span>
                </>
              }
            />
            <Feature
              img={
                <img src="./service.webp" alt="Service" className="w-44 h-44" />
              }
              title={t("whyKraken_section_service_title")}
              description={
                <>
                  <span>{t("whyKraken_section_service_desc1")}</span>
                  <span className="text-purple-600">{t("whyKraken_section_service_span")}</span>.
                  <span> {t("whyKraken_section_service_desc2")}</span>
                </>
              }
            />
          </div>
          <div className="text-center mt-12">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition duration-300 font-medium">
              {t("whyKraken_section_button")}
            </button>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-10">

            {/* Logo and Account Section */}
            <div className="lg:col-span-2">
              <FooterLogo className="w-28 mb-4" />
              <p className="mb-4 text-xl text-purple-200 font-medium">{t("account_section_title")}</p>
              <button className="bg-white text-purple-600 px-6 py-2 rounded-full hover:bg-purple-100 transition duration-300 mb-6 font-medium">
                {t("account_section_button")}
              </button>
              <div className="flex space-x-4">
                <div>
                  <img src="./kraken-pro-app.webp" alt="Kraken Pro App" className="w-10 h-10" loading="lazy" />
                </div>
                <div>
                  <img src="./kraken-wallet-app.webp" alt="Kraken Pro App" className="w-10 h-10" loading="lazy" />
                </div>
                <div>
                  <img src="./download.png" alt="Kraken Pro App" className="w-10 h-10" loading="lazy" />
                </div>
              </div>
            </div>

            {/* Features Column */}
            <FooterFeature translate={t} />

            {/* Browse Prices Column */}
            <BrowsePrice translate={t} />

            {/* Buying Guides Column */}
            <BuyingGuide translate={t} />
          </div>


          {/* ========================= */}
          {/* Crypto Education and Community */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company and Popular Markets Columns */}
            <div className="lg:col-span-2"></div>
            {/* Company */}
            <Company translate={t} />
            {/* Popular Markets */}
            <PopularMarket translate={t} />
            <div>
              <h3 className="font-bold mb-4 text-2xl text-purple-200">{t("community_title")}</h3>
              <div className="flex space-x-4">
                <Instagram />
                <Facebook />
                <Linkedin />
                <Twitter />
                <Youtube />
                <TikTok />
                <Telegram />
              </div>
            </div>
          </div>


          {/* ------------------------------------------------------------------------------------ */}
          {/* Legal Links */}
          <div className="mt-12 pt-8 border-t border-purple-500">
            <div className="flex flex-wrap justify-between items-center">
              <p className="text-sm">&copy; {t("date")}</p>
              <div className="flex space-x-4 text-sm">
                <a href="#" className="hover:underline">{t("privacy_notice")}</a>
                <a href="#" className="hover:underline">{t("terms_of_service")}</a>
                <a href="#" className="hover:underline">{t("cookie_settings")}</a>
                <a href="#" className="hover:underline">{t("disclosures")}</a>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-8 text-xs opacity-80">
            {t("footer_text")}
          </p>
        </div>
      </footer>



    </main>
  );
}


const Feature = ({ img, title, description }: { img: React.ReactNode; title: string; description: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4">{img}</div>
      <h3 className="text-3xl font-semibold mb-2">{title}</h3>
      <div className="px-24">
        <p className="text-gray-900 text-[17px]">{description}</p>
      </div>
    </div>
  )
}
const FooterLogo = ({ className }: { className?: string }) => {
  return (
    <img className={className} src='./footer-logo.svg' loading='lazy' alt="Kraken Logo" />
  )
}

const FooterFeature = ({ translate }: { translate: any }) => (
  <div>
    <h3 className="font-bold mb-4 text-2xl text-purple-200">{translate("FooterFeature.title")}</h3>
    <ul className="space-y-2">
      {["NFT Marketplace", "Margin Trading", "Futures Trading", "OTC Trading", "Institutions", "API Trading", "Staking Rewards", "All features"].map((item) => (
        <li key={item}><a href="#" className="hover:underline">{translate(`FooterFeature.${item}.title`)}</a></li>
      ))}
    </ul>
  </div>
)

const BrowsePrice = ({ translate }: { translate: any }) => (
  <div>
    <h3 className="font-bold mb-4 text-2xl text-purple-200">{translate("BrowsePrice.title")}</h3>
    <ul className="space-y-2">
      {["Bitcoin Price", "Ethereum Price", "Dogecoin Price", "XRP Price", "Cardano Price", "Solana Price", "Litecoin Price", "All crypto prices"].map((item) => (
        <li key={item}><a href="#" className="hover:underline">{translate(`BrowsePrice.${item}.title`)}</a></li>
      ))}
    </ul>
  </div>
)

const BuyingGuide = ({ translate }: { translate: any }) => (
  <div>
    <h3 className="font-bold mb-4 text-2xl text-purple-200">{translate("BuyingGuide.title")}</h3>
    <ul className="space-y-2">
      {["Buy Bitcoin", "Buy Ethereum", "Buy Dogecoin", "Buy XRP", "Buy Cardano", "Buy Solana", "Buy Litecoin", "All crypto guides"].map((item) => (
        <li key={item}><a href="#" className="hover:underline">{translate(`BuyingGuide.${item}.title`)}</a></li>
      ))}
    </ul>
  </div>
)

const Company = ({ translate }: { translate: any }) => (
  <div>
    <h3 className="font-bold mb-4 text-2xl text-purple-200">{translate("Company.title")}</h3>
    <ul className="space-y-2 mb-8">
      {["Kraken Security", "Kraken Careers", "Kraken Blog", "Kraken Labs", "Affiliate Program", "Asset Listings", "Kraken Status", "Support Center"].map((item) => (
        <li key={item}><a href="#" className="hover:underline">{translate(`Company.${item}.title`)}</a></li>
      ))}
    </ul>
  </div>
)

const PopularMarket = ({ translate }: { translate: any }) => (
  <div>
    <h3 className="font-bold mb-4 text-2xl text-purple-200">{translate("PopularMarket.title")}</h3>
    <ul className="space-y-2">
      {["BTC to USD", "ETH to USD", "DOGE to USD", "XRP to USD", "ADA to USD", "SOL to USD", "LTC to USD", "All crypto markets"].map((item) => (
        <li key={item}><a href="#" className="hover:underline">{translate(`PopularMarket.${item}.title`)}</a></li>
      ))}
    </ul>
  </div>
)




const Instagram = () => (
  <svg aria-hidden="true" data-prefix="fab" data-icon="instagram" className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path></svg>
)

const TikTok = () => (
  <svg width="16" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4"><path d="M15.83 4.383c0-.081-.002-.085-.087-.083-.204 0-.407-.023-.608-.054-.73-.11-3.103-1.354-3.504-3.388-.008-.04-.098-.545-.098-.76 0-.095 0-.097-.095-.097H8.588c-.186 0-.161-.023-.161.163v12.071c0 .151-.004.3-.031.447-.14.778-.538 1.389-1.213 1.805-.584.36-1.22.464-1.894.33-.213-.042-.412-.123-.61-.202a.992.992 0 0 1-.048-.043c-.066-.056-.14-.104-.213-.153-.86-.594-1.267-1.42-1.143-2.453.127-1.047.729-1.76 1.722-2.126.296-.11.609-.155.925-.136.205.01.408.037.605.093.068.019.105-.004.11-.077v-.076c0-.723-.027-2.3-.031-2.304 0-.207 0-.416.006-.623 0-.06-.03-.07-.079-.076a5.848 5.848 0 0 0-2.64.296 5.646 5.646 0 0 0-2.06 1.295 5.608 5.608 0 0 0-1.2 1.724 5.596 5.596 0 0 0-.475 2.838 5.655 5.655 0 0 0 2.167 3.97c.093.074.184.155.296.202l.141.125c.149.111.308.209.476.29 1.03.509 2.117.716 3.262.577 1.486-.182 2.724-.84 3.697-1.975.916-1.068 1.361-2.32 1.37-3.721.012-2.004.002-4.007.004-6.013 0-.047-.027-.115.025-.14.041-.019.082.035.122.062.745.49 1.55.844 2.421 1.043a6.888 6.888 0 0 0 1.54.186c.164 0 .187-.008.187-.172 0-.712-.038-2.657-.036-2.845Z" fill="#fff"></path></svg>
)
const Youtube = () => (
  <svg width="22" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6"><path d="M17.624 2.668a2.254 2.254 0 0 0-1.592-1.592C14.628.7 9 .7 9 .7s-5.628 0-7.032.376A2.258 2.258 0 0 0 .376 2.668C0 4.072 0 7 0 7s0 2.928.376 4.332a2.254 2.254 0 0 0 1.592 1.592C3.372 13.3 9 13.3 9 13.3s5.628 0 7.032-.376a2.258 2.258 0 0 0 1.592-1.592C18 9.928 18 7 18 7s0-2.928-.376-4.332ZM7.2 9.7V4.3L11.876 7 7.2 9.7Z" fill="#fff"></path></svg>
)
const Facebook = () => (
  <svg aria-hidden="true" data-prefix="fab" data-icon="facebook-f" className="w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="m279.14 288 14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path></svg>
)

const Twitter = () => (
  <svg aria-hidden="true" data-prefix="fab" data-icon="twitter" className="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg>
)
const Telegram = () => (
  <svg width="18" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5"><path d="M17.965.894c-.065-.188-.142-.24-.262-.286-.263-.1-.708.05-.708.05S1.22 6.33.32 6.957c-.195.135-.26.212-.29.305-.155.447.33.645.33.645l4.065 1.325s.153.022.205-.013c.925-.585 9.306-5.875 9.789-6.053.077-.022.132.003.117.055-.192.68-7.47 7.149-7.47 7.149s-.028.035-.046.075l-.01-.005-.38 4.033s-.16 1.235 1.078 0c.872-.873 1.715-1.6 2.138-1.956 1.397.965 2.902 2.033 3.55 2.59.325.28.6.326.823.318.615-.022.787-.7.787-.7s2.876-11.569 2.97-13.119c.01-.152.023-.247.023-.352 0-.145-.012-.29-.035-.36Z" fill="#fff"></path></svg>
)

const Linkedin = () => (
  <svg aria-hidden="true" data-prefix="fab" data-icon="linkedin-in" className="w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path></svg>
)