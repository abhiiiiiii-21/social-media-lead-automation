import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InstagramService } from '@/lib/services/instagram-service';
import { ScraperType, ScrapingConfig } from '@/lib/types/instagram';

export function useScrapingCampaigns() {
  return useQuery({
    queryKey: ['instagram-scraping-campaigns'],
    queryFn: () => InstagramService.getCampaigns(),
  });
}

export function useScrapingCampaign(id: string) {
  return useQuery({
    queryKey: ['instagram-scraping-campaigns', id],
    queryFn: () => InstagramService.getCampaign(id),
    enabled: !!id,
  });
}

export function useCreateScrapingCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, scraperType, config }: { name: string, scraperType: ScraperType, config: ScrapingConfig }) => 
      InstagramService.createCampaign(name, scraperType, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-scraping-campaigns'] });
    },
  });
}

export function useScrapedLeads(campaignId?: string) {
  return useQuery({
    queryKey: ['instagram-scraped-leads', campaignId],
    queryFn: () => InstagramService.getLeads(campaignId),
  });
}
