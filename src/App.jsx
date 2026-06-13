import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, Users, IndianRupee, Sparkles, CheckCircle2, ChevronDown, ListPlus, Copy, Download, AlertCircle, ArrowRight, Salad, FireExtinguisher, Flame, ChevronUp } from 'lucide-react';

const UNSPLASH_IMAGES = {
  Breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=2940&auto=format&fit=crop",
  Lunch: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2940&auto=format&fit=crop",
  Dinner: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2938&auto=format&fit=crop"
};

const SYSTEM_PROMPT = `You are a world-class culinary AI planner. Return ONLY a raw JSON object with the following exact structure, with no markdown formatting or backticks around it:
{
  "meals": [
    {
      "type": "Breakfast",
      "name": "Meal Name",
      "prepTime": "XX mins",
      "calories": "XXX kcal",
      "difficulty": "Easy|Medium|Hard",
      "steps": [
        {"category": "Prep", "instruction": "Step detail..."},
        {"category": "Cook", "instruction": "Step detail..."},
        {"category": "Plate", "instruction": "Step detail..."}
      ]
    }
  ],
  "groceryList": [
    {"category": "Vegetables", "items": ["Item 1", "Item 2"]}
  ],
  "substitutions": [
    {"original": "Ingredient", "alternatives": ["Alt 1", "Alt 2"]}
  ],
  "budgetAnalysis": {
    "costPerMeal": {"Breakfast": "₹XX", "Lunch": "₹XX", "Dinner": "₹XX"},
    "totalCost": "₹XXX",
    "status": "✅ Within budget",
    "suggestion": "Optional suggestion to save money"
  }
}
Must provide exactly 3 meals: Breakfast, Lunch, Dinner in that order.`;

export default function App() {
  const [appState, setAppState] = useState('onboarding'); // onboarding, loading, results
  const [apiKey, setApiKey] = useState('');
  
  // Form State
  const [peopleCount, setPeopleCount] = useState(2);
  const [dietaryPrefs, setDietaryPrefs] = useState('None');
  const [timePerMeal, setTimePerMeal] = useState('Moderate');
  const [dailyBudget, setDailyBudget] = useState(1500);
  const [cuisineMood, setCuisineMood] = useState('Indian');

  // Result State
  const [planData, setPlanData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [expandedMeal, setExpandedMeal] = useState('Breakfast');
  const [checkedSteps, setCheckedSteps] = useState({});
  const [checkedGroceries, setCheckedGroceries] = useState({});
  const [expandedSubstitutions, setExpandedSubstitutions] = useState({});

  const quotes = [
    "Cooking is like love. It should be entered into with abandon or not at all.",
    "People who love to eat are always the best people.",
    "First we eat, then we do everything else.",
    "A recipe has no soul. You, as the cook, must bring soul to the recipe."
  ];
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    if (appState === 'loading') {
      const interval = setInterval(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const handleGenerate = async () => {
    if (!apiKey) {
      setErrorMsg("Please enter your Anthropic API Key to proceed.");
      return;
    }
    setErrorMsg('');
    setAppState('loading');

    const prompt = `Please create a daily meal plan (Breakfast, Lunch, Dinner) for ${peopleCount} people.
    Dietary Preferences: ${dietaryPrefs}
    Time Available Per Meal: ${timePerMeal}
    Daily Budget: ₹${dailyBudget}
    Cuisine Mood: ${cuisineMood}
    Remember to follow the exact JSON structure requested.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 3000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Failed to generate plan");
      }

      const data = await response.json();
      const content = data.content[0].text.trim();
      const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
      const parsedData = JSON.parse(jsonStr);
      setPlanData(parsedData);
      setAppState('results');
      setCheckedSteps({});
      setCheckedGroceries({});
      setExpandedMeal('Breakfast');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "An error occurred while generating the plan.");
      setAppState('onboarding');
    }
  };

  const getMealProgress = (mealIndex, meal) => {
    if (!meal.steps || meal.steps.length === 0) return 0;
    let completed = 0;
    meal.steps.forEach((_, i) => {
      if (checkedSteps[`${mealIndex}-${i}`]) completed++;
    });
    return Math.round((completed / meal.steps.length) * 100);
  };

  const copyGroceries = () => {
    if (!planData?.groceryList) return;
    const text = planData.groceryList.map(cat => 
      `${cat.category}:\n` + cat.items.map(item => `- ${item}`).join('\n')
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Grocery list copied to clipboard!');
  };

  const renderOnboarding = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
      className="max-w-2xl mx-auto mt-10 p-8 glass-card rounded-3xl"
    >
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4"><ChefHat size={48} className="text-brand-blue" /></div>
        <h1 className="text-4xl font-serif font-bold text-brand-grayDark mb-2">Curate Your Day</h1>
        <p className="text-brand-gray">Personalized fine dining, designed by AI.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} /> <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2"><ChefHat size={16} /> Anthropic API Key</label>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            placeholder="sk-ant-..." 
            className="w-full p-4 rounded-xl glass-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Users size={16} /> People</label>
            <div className="flex gap-2">
              {[1, 2, 4, 6].map(num => (
                <button 
                  key={num} 
                  onClick={() => setPeopleCount(num)}
                  className={`flex-1 py-3 rounded-xl transition-all ${peopleCount === num ? 'bg-brand-grayDark text-white shadow-lg' : 'bg-white/50 hover:bg-white'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Clock size={16} /> Time per Meal</label>
            <select value={timePerMeal} onChange={(e) => setTimePerMeal(e.target.value)} className="w-full p-3.5 rounded-xl glass-input appearance-none">
              <option>Quick (&lt;30m)</option>
              <option>Moderate (30m-1h)</option>
              <option>Elaborate (1h+)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2"><IndianRupee size={16} /> Daily Budget (₹{dailyBudget})</label>
          <input 
            type="range" min="300" max="5000" step="100" 
            value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)}
            className="w-full accent-brand-grayDark"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Salad size={16} /> Diet</label>
            <select value={dietaryPrefs} onChange={(e) => setDietaryPrefs(e.target.value)} className="w-full p-3.5 rounded-xl glass-input appearance-none">
              <option>None</option>
              <option>Vegetarian</option>
              <option>Vegan</option>
              <option>Gluten-Free</option>
              <option>Keto</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Flame size={16} /> Cuisine</label>
            <select value={cuisineMood} onChange={(e) => setCuisineMood(e.target.value)} className="w-full p-3.5 rounded-xl glass-input appearance-none">
              <option>Indian</option>
              <option>Continental</option>
              <option>Asian</option>
              <option>Mediterranean</option>
              <option>Mexican</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          className="w-full mt-8 bg-brand-grayDark text-white p-4 rounded-xl font-medium text-lg flex items-center justify-center gap-3 hover:bg-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
        >
          <Sparkles size={20} /> Generate My Menu
        </button>
      </div>
    </motion.div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="mb-8"
      >
        <div className="w-24 h-24 border-4 border-brand-blue border-t-brand-grayDark rounded-full" />
      </motion.div>
      <motion.p 
        key={quote}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-xl font-serif text-brand-grayDark text-center max-w-md italic"
      >
        "{quote}"
      </motion.p>
    </div>
  );

  const renderResults = () => {
    if (!planData) return null;
    
    return (
      <div className="max-w-5xl mx-auto py-10 space-y-12">
        <header className="flex justify-between items-center bg-white/40 p-6 rounded-3xl backdrop-blur-md shadow-sm border border-white/40">
          <div>
            <h2 className="text-3xl font-serif font-bold text-brand-grayDark">Your Daily Menu</h2>
            <p className="text-brand-gray mt-1 flex items-center gap-2">
              <Users size={16} /> {peopleCount} people • <Clock size={16} /> {timePerMeal} • <IndianRupee size={16} /> ₹{dailyBudget}
            </p>
          </div>
          <button onClick={() => setAppState('onboarding')} className="px-6 py-2 bg-white rounded-full text-sm font-medium shadow hover:shadow-md transition-all">Start Over</button>
        </header>

        {/* Meal Cards */}
        <div className="space-y-6">
          {planData.meals.map((meal, index) => {
            const isExpanded = expandedMeal === meal.type;
            const progress = getMealProgress(index, meal);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                key={meal.type} 
                className="glass-card rounded-3xl overflow-hidden cursor-pointer"
              >
                <div 
                  className="flex flex-col md:flex-row h-auto md:h-48"
                  onClick={() => setExpandedMeal(isExpanded ? null : meal.type)}
                >
                  <div className="w-full md:w-1/3 h-48 md:h-full relative overflow-hidden group">
                    <img 
                      src={UNSPLASH_IMAGES[meal.type] || UNSPLASH_IMAGES.Dinner} 
                      alt={meal.type} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <h3 className="absolute bottom-4 left-6 text-3xl font-serif text-white">{meal.type}</h3>
                  </div>
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xl font-bold text-brand-grayDark">{meal.name}</h4>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${meal.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : meal.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {meal.difficulty}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-3 text-sm text-brand-gray">
                        <span className="flex items-center gap-1"><Clock size={14}/> {meal.prepTime}</span>
                        <span className="flex items-center gap-1"><Flame size={14}/> {meal.calories}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex-1 bg-brand-lightBlue/30 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${progress}%` }} 
                          className="bg-brand-grayDark h-full"
                        />
                      </div>
                      <span className="text-xs font-semibold">{progress}%</span>
                      {isExpanded ? <ChevronUp size={20} className="text-brand-gray" /> : <ChevronDown size={20} className="text-brand-gray" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 bg-white/30"
                    >
                      <div className="p-8 space-y-6">
                        <h5 className="font-serif text-lg font-semibold flex items-center gap-2"><ListPlus size={20} /> Cooking Steps</h5>
                        <div className="space-y-3">
                          {meal.steps.map((step, sIndex) => {
                            const stepId = `${index}-${sIndex}`;
                            const isChecked = checkedSteps[stepId];
                            return (
                              <motion.div 
                                key={sIndex}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={(e) => { e.stopPropagation(); toggleStep(index, sIndex); }}
                                className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${isChecked ? 'bg-green-50/50 border-green-200' : 'bg-white/60 border-white/60 hover:border-brand-blue'}`}
                              >
                                <div className={`mt-1 rounded-full p-1 transition-colors ${isChecked ? 'text-green-500 bg-green-100' : 'text-gray-300 bg-gray-100'}`}>
                                  <CheckCircle2 size={20} />
                                </div>
                                <div>
                                  <span className={`text-xs font-bold uppercase tracking-wider ${isChecked ? 'text-green-600' : 'text-brand-blue'}`}>{step.category}</span>
                                  <p className={`mt-1 text-sm ${isChecked ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{step.instruction}</p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Lower Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Grocery List */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-card rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif font-bold">Grocery List</h3>
              <button onClick={copyGroceries} className="p-2 hover:bg-white/50 rounded-xl transition-all" title="Copy List"><Copy size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {planData.groceryList.map((cat, cIndex) => (
                <div key={cIndex} className="space-y-3">
                  <h4 className="font-semibold text-brand-blue uppercase text-xs tracking-wider border-b border-brand-blue/20 pb-2">{cat.category}</h4>
                  <ul className="space-y-2">
                    {cat.items.map((item, iIndex) => {
                      const id = `${cIndex}-${iIndex}`;
                      const isChecked = checkedGroceries[id];
                      return (
                        <li key={iIndex} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleGrocery(cIndex, iIndex)}>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-grayDark border-brand-grayDark' : 'border-gray-300 group-hover:border-brand-grayDark'}`}>
                            {isChecked && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                          <span className={`text-sm transition-all ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Sidebar: Budget & Subs */}
          <div className="space-y-6">
            {/* Budget Card */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-serif font-bold mb-4">Budget Feasibility</h3>
              <div className="space-y-3 mb-6">
                {Object.entries(planData.budgetAnalysis.costPerMeal).map(([meal, cost]) => (
                  <div key={meal} className="flex justify-between text-sm">
                    <span className="text-gray-600">{meal}</span>
                    <span className="font-medium">{cost}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{planData.budgetAnalysis.totalCost}</span>
                </div>
              </div>
              <div className={`p-4 rounded-xl text-center font-medium ${planData.budgetAnalysis.status.includes('❌') ? 'bg-red-50 text-red-700' : planData.budgetAnalysis.status.includes('⚠️') ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                {planData.budgetAnalysis.status}
              </div>
              {planData.budgetAnalysis.suggestion && (
                <p className="text-xs text-gray-500 mt-4 text-center italic">{planData.budgetAnalysis.suggestion}</p>
              )}
            </motion.div>

            {/* Substitutions */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-serif font-bold mb-4">Substitutions</h3>
              <div className="space-y-3">
                {planData.substitutions.map((sub, i) => (
                  <div key={i} className="bg-white/50 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setExpandedSubstitutions(p => ({...p, [i]: !p[i]}))}
                      className="w-full p-4 flex justify-between items-center text-sm font-medium hover:bg-white/80 transition-all"
                    >
                      {sub.original}
                      {expandedSubstitutions[i] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence>
                      {expandedSubstitutions[i] && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-4 pb-4">
                          <div className="text-xs text-gray-600 space-y-1 pl-2 border-l-2 border-brand-blue">
                            {sub.alternatives.map((alt, ai) => <p key={ai}>• {alt}</p>)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <AnimatePresence mode="wait">
        {appState === 'onboarding' && <motion.div key="onboarding" exit={{ opacity: 0, y: -20 }}>{renderOnboarding()}</motion.div>}
        {appState === 'loading' && <motion.div key="loading" exit={{ opacity: 0 }}>{renderLoading()}</motion.div>}
        {appState === 'results' && <motion.div key="results" exit={{ opacity: 0, y: 20 }}>{renderResults()}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
