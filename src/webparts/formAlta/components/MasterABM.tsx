import * as React from 'react';
import { IMasterABMProps } from './IMasterABMProps';
import GrillaABM from './GrillaABM';

export default class MasterABM extends React.Component<IMasterABMProps, {}> {
  public render(): React.ReactElement<IMasterABMProps> {
    const {
      
    } = this.props;

    return (
      <section>
       <GrillaABM registrosPorPagina={this.props.registrosPorPagina} VerSoloCreadoPor={this.props.VerSoloCreadoPor} context={this.props.context}/>
      </section>
    );
  }
}
