export interface AWSService {
  service_name: string;
  category: string;
  description: string;
  feynman_definition: string;
  architectural_deep_dive: string;
  scenario_example: string;
  aws_user_guide_documentation: string;
}

export interface AWSData {
  metadata: {
    title: string;
    description: string;
    version: string;
    total_services: number;
    author: string;
    last_updated: string;
    categories: string[];
  };
  services: AWSService[];
}

export interface CategoryInfo {
  name: string;
  slug: string;
  serviceCount: number;
  description: string;
  icon: string;
}
