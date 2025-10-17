/**
 * Parse the structured itinerary content from AI response
 */
export const parseItinerary = (content) => {
  const sections = {
    whyVisit: '',
    whereToStay: {
      name: '',
      price: '',
      description: ''
    },
    days: [],
    budget: [],
    hiddenGems: [],
    tips: []
  };

  const lines = content.split('\n');
  let currentSection = null;
  let currentDay = null;
  let currentActivity = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Section headers
    if (line.includes('**Why Visit:**')) {
      currentSection = 'whyVisit';
      continue;
    } else if (line.includes('**Where to Stay:**')) {
      currentSection = 'whereToStay';
      continue;
    } else if (line.match(/\*\*Day \d+:/)) {
      currentSection = 'day';
      const title = line.replace(/\*\*/g, '').trim();
      currentDay = {
        title,
        activities: []
      };
      sections.days.push(currentDay);
      continue;
    } else if (line.includes('**Budget Breakdown:**')) {
      currentSection = 'budget';
      continue;
    } else if (line.includes('**Hidden Gems:**')) {
      currentSection = 'hiddenGems';
      continue;
    } else if (line.includes('**Practical Tips:**')) {
      currentSection = 'tips';
      continue;
    }

    // Parse content based on current section
    if (currentSection === 'whyVisit' && line && !line.startsWith('**')) {
      sections.whyVisit += (sections.whyVisit ? ' ' : '') + line;
    }

    if (currentSection === 'whereToStay') {
      if (line.includes(' - ₹') && !sections.whereToStay.name) {
        const parts = line.split(' - ₹');
        sections.whereToStay.name = parts[0].trim();
        sections.whereToStay.price = '₹' + parts[1].split(' - ')[0].trim();
      } else if (line && !line.startsWith('**') && sections.whereToStay.name) {
        sections.whereToStay.description += (sections.whereToStay.description ? ' ' : '') + line;
      }
    }

    if (currentSection === 'day' && currentDay) {
      if (line.startsWith('ACTIVITY:')) {
        if (currentActivity) {
          currentDay.activities.push(currentActivity);
        }
        currentActivity = {
          name: line.replace('ACTIVITY:', '').trim(),
          time: '',
          details: '',
          cost: '',
          icon: ''
        };
      } else if (line.startsWith('TIME:') && currentActivity) {
        currentActivity.time = line.replace('TIME:', '').trim();
      } else if (line.startsWith('DETAILS:') && currentActivity) {
        currentActivity.details = line.replace('DETAILS:', '').trim();
      } else if (line.startsWith('COST:') && currentActivity) {
        currentActivity.cost = line.replace('COST:', '').trim();
      } else if (line.startsWith('ICON:') && currentActivity) {
        currentActivity.icon = line.replace('ICON:', '').trim();
      }
    }

    if (currentSection === 'budget') {
      if (line.startsWith('CATEGORY:')) {
        const category = line.replace('CATEGORY:', '').trim();
        const budgetItem = {
          category,
          details: '',
          amount: ''
        };
        sections.budget.push(budgetItem);
      } else if (line.startsWith('DETAILS:') && sections.budget.length > 0) {
        sections.budget[sections.budget.length - 1].details = line.replace('DETAILS:', '').trim();
      } else if (line.startsWith('AMOUNT:') && sections.budget.length > 0) {
        sections.budget[sections.budget.length - 1].amount = line.replace('AMOUNT:', '').trim();
      }
    }

    if (currentSection === 'hiddenGems') {
      if (line.startsWith('GEM:')) {
        const gem = {
          name: line.replace('GEM:', '').trim(),
          description: ''
        };
        sections.hiddenGems.push(gem);
      } else if (line.startsWith('DESCRIPTION:') && sections.hiddenGems.length > 0) {
        sections.hiddenGems[sections.hiddenGems.length - 1].description = line.replace('DESCRIPTION:', '').trim();
      }
    }

    if (currentSection === 'tips') {
      if (line.startsWith('BEST TIME:')) {
        sections.tips.push({
          type: 'best_time',
          content: line.replace('BEST TIME:', '').trim()
        });
      } else if (line.startsWith('PACKING ESSENTIALS:')) {
        const packingItems = [];
        let j = i + 1;
        while (j < lines.length && lines[j].trim().startsWith('-')) {
          packingItems.push(lines[j].trim().replace(/^-\s*/, ''));
          j++;
        }
        sections.tips.push({
          type: 'packing',
          content: packingItems
        });
        i = j - 1;
      } else if (line.startsWith('LOCAL TRANSPORT:')) {
        sections.tips.push({
          type: 'local_transport',
          content: line.replace('LOCAL TRANSPORT:', '').trim()
        });
      } else if (line.startsWith('BOOKING TIPS:')) {
        sections.tips.push({
          type: 'booking',
          content: line.replace('BOOKING TIPS:', '').trim()
        });
      }
    }
  }

  // Add last activity if exists
  if (currentActivity && currentDay) {
    currentDay.activities.push(currentActivity);
  }

  return sections;
};
