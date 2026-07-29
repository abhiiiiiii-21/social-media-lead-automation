import { ScrapingCampaign, ScrapedLead, ScraperType, ScrapingConfig } from "../types/instagram";
import { MOCK_SCRAPING_CAMPAIGNS, MOCK_SCRAPED_LEADS } from "../data/mock-instagram";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const InstagramService = {
  /**
   * Get all scraping campaigns
   */
  async getCampaigns(): Promise<ScrapingCampaign[]> {
    await delay(500);
    return MOCK_SCRAPING_CAMPAIGNS;
  },

  /**
   * Get a specific scraping campaign by ID
   */
  async getCampaign(id: string): Promise<ScrapingCampaign | undefined> {
    await delay(300);
    return MOCK_SCRAPING_CAMPAIGNS.find(c => c.id === id);
  },

  /**
   * Start a new scraping campaign
   */
  async createCampaign(name: string, scraperType: ScraperType, config: ScrapingConfig): Promise<ScrapingCampaign> {
    await delay(800);
    const targetCount = config.targetLeads || config.maximumProfiles || config.targetProfiles || 100;
    
    const newCampaign: ScrapingCampaign = {
      id: `sc_${Math.random().toString(36).substr(2, 9)}`,
      name,
      scraperType,
      status: "Pending",
      targetCount: targetCount,
      collectedCount: 0,
      config,
      startedAt: new Date().toISOString(),
      // We'll generate mock metrics for the simulation
      metrics: {
        qualified: Math.floor(targetCount * 0.7),
        rejected: Math.floor(targetCount * 0.3),
        websitesFound: Math.floor(targetCount * 0.4),
        emailsFound: Math.floor(targetCount * 0.6),
        phonesFound: Math.floor(targetCount * 0.1),
        averageQualityScore: Math.floor(Math.random() * (95 - 65 + 1) + 65)
      }
    };
    
    // In a real app, this would be saved to a database.
    MOCK_SCRAPING_CAMPAIGNS.unshift(newCampaign);
    return newCampaign;
  },

  /**
   * Get all scraped leads across all campaigns, or filtered by a specific campaign
   */
  async getLeads(campaignId?: string): Promise<ScrapedLead[]> {
    await delay(600);
    if (campaignId) {
      return MOCK_SCRAPED_LEADS.filter(l => l.campaignId === campaignId);
    }
    return MOCK_SCRAPED_LEADS;
  }
};
