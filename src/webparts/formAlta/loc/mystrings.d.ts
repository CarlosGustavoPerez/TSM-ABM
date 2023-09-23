declare interface IFormAltaWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
}

declare module 'FormAltaWebPartStrings' {
  const strings: IFormAltaWebPartStrings;
  export = strings;
}
declare module "*.png" {
  const value: any;
  export default value;
}