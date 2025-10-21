import farmfiHero from '../../assets/farmfi-hero.png.jpg';

const WelcomeCard = ({ name }) => (
  <div className="bg-gradient-to-br from-emerald-400 via-green-100 to-yellow-50 rounded-3xl p-7 shadow flex flex-col sm:flex-row items-center justify-between border border-green-100 mb-8">
    <div className="flex-1">
      <h2 className="text-3xl md:text-4xl font-extrabold text-green-900 mb-2 tracking-tight">
        👋 Welcome to <span className="text-emerald-600">FarmFi</span>, {name}!
      </h2>
      <div className="text-lg md:text-xl text-green-800 mb-3 font-medium">Your Smart Farming Dashboard</div>
      <ul className="pl-4 text-gray-700 text-md font-medium space-y-1 list-disc">
        <li>Track and manage your fields easily</li>
        <li>Monitor crops & yields with real-time insights</li>
        <li>Access personalized tips for higher productivity 🌱</li>
      </ul>
    </div>
    <div className="mt-6 sm:mt-0 sm:ml-6 flex-shrink-0">
      <img
        src={farmfiHero}
        alt="FarmFi Dashboard Hero"
        className="w-[110px] md:w-[150px] rounded-2xl shadow-lg border border-green-200"
        loading="lazy"
      />
    </div>
  </div>
);

export default WelcomeCard;
