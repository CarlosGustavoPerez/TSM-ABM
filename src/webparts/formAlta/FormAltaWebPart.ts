import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'FormAltaWebPartStrings';
import FormAlta from './components/MasterABM';
import { IMasterABMProps } from './components/IMasterABMProps';
import { sp } from "@pnp/sp/presets/all";

export interface IFormAltaWebPartProps {
  registrosPorPagina: string;
  VerSoloCreadoPor: string;
}

export default class FormAltaWebPart extends BaseClientSideWebPart<IFormAltaWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  protected onInit(): Promise<void> {
    this._environmentMessage = this._getEnvironmentMessage();

    return super.onInit().then(_ => {
      sp.setup({
        spfxContext: this.context
        });
      });
  }

  public render(): void {
    const element: React.ReactElement<IMasterABMProps> = React.createElement(
      FormAlta,
      {
        context:this.context,
        registrosPorPagina: this.properties.registrosPorPagina,
        VerSoloCreadoPor: this.properties.VerSoloCreadoPor
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams
      return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }

    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;
    this.domElement.style.setProperty('--bodyText', semanticColors.bodyText);
    this.domElement.style.setProperty('--link', semanticColors.link);
    this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered);

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: "Parámetros iniciales",
              groupFields: [
                PropertyPaneTextField('registrosPorPagina', {
                  label:"Ingrese cuántos registros por página ver",
                  value:"15"
                }),
                PropertyPaneTextField('VerSoloCreadoPor', {
                  label:"Visualizar solo los creado por el usuario",
                  value:"NO"
                })
               
              ]
            }
          ]
        }
      ]
    };
  }
}
