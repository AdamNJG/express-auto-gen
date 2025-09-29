export type AutoApiConfig = {
  api_folders: ApiFolder[]
  
}

type ApiFolder = {
  directory: string;
  api_slug: string;
}