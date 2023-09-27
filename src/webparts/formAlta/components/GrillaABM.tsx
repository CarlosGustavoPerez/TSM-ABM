import * as React from 'react';
import styles from './EstilosABM.module.scss';
import { useState, useEffect } from 'react';
import { Persona, PersonaSize,FocusZone, FocusZoneDirection,Panel,PanelType,DefaultButton,IIconProps,ITextFieldStyleProps, ITextFieldStyles, ILabelStyles, ILabelStyleProps,  } from '@fluentui/react';
import { Pagination } from '@pnp/spfx-controls-react/lib/pagination';
import { getRTL } from '@fluentui/react/lib/Utilities';
import { TextField } from '@fluentui/react/lib/TextField';
import { Image, ImageFit } from '@fluentui/react/lib/Image';
import { Icon } from '@fluentui/react/lib/Icon';
import { List } from '@fluentui/react/lib/List';
import { ITheme, mergeStyleSets, getTheme } from '@fluentui/react/lib/Styling';
import { sp } from "@pnp/sp/presets/all";
import FormABM from './FormABM';
import defaultimg from "./../assets/imagenPerfil.png"
import  { LivePersona } from "@pnp/spfx-controls-react";

export interface IMasterABMProps {
  registrosPorPagina:string;
  context: any | null;
}
const theme: ITheme = getTheme();
const { palette, semanticColors, fonts } = theme;
const stateColors = {
  PENDIENTE: palette.yellow,
  RECHAZADO: palette.red,
  APROBADO: palette.green,
};
const classNames = mergeStyleSets({
  itemImage: {
    flexShrink: 0,
  },
  itemContent: {
    marginLeft: 10,
    overflow: 'hidden',
    flexGrow: 1,
  },
  itemName: [
    fonts.xLarge,
    {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  ],
  itemIndex: {
    fontSize: fonts.small.fontSize,
    color: palette.neutralTertiary,
    marginBottom: 10,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 10,
    color: '#0078D4',
    fontSize: fonts.large.fontSize,
    flexShrink: 0,
  },
  fechaCreacion: {
    // Estilos para la fecha de creación
    fontSize: '12px',
    color: 'gray', // Puedes ajustar el color según tus preferencias
    marginTop: '5px', // Espacio superior para separar la fecha de creación de otros elementos
  },
});
function getStyles(props: ITextFieldStyleProps): Partial<ITextFieldStyles> {
  return {
    fieldGroup: [
       {
        borderColor: props.theme.palette.themePrimary,
      },
    ],
    subComponentStyles: {
      label: getLabelStyles,
    },
    root: {
      marginBottom: '10px',
    },
  };
}
function getLabelStyles(props: ILabelStyleProps): ILabelStyles {
  return {
    root:  {
      color: props.theme.palette.themePrimary,
    },
  };
}
const NuevaEmision: IIconProps = { iconName: 'PageAdd' };
const GrillaABM: React.FC<IMasterABMProps> = (props: IMasterABMProps) => {
  useEffect(() => {
    if(props.registrosPorPagina != null){
      setCantRegistros(parseInt(props.registrosPorPagina));
    }
    CargarProveedores();
  }, []);
  
  const [cantRegistros, setCantRegistros] = useState(10);
  const [proveedores, setProveedores] = useState([]);
  const [todosLosProveedores, setTodosLosProveedores] = useState([]);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  //const [fotoUsuario, setFotoUsuario] = useState();

  
  const [cantidadPaginas, setCantidadPaginas] = useState("1");

  const cambiarPagina = async (page: number): Promise<void> => {
    const irApagina= Math.ceil(page);
    setProveedores(todosLosProveedores.slice(((irApagina-1)*cantRegistros), irApagina*cantRegistros));
  };
  const onItemClicked = async (item) => {
    setProveedorSeleccionado(item);
    setIsPanelOpen(true);
  };
  const CargarProveedores = async () => {
    const response = await sp.web.lists
    .getByTitle('ABMProveedores')
    .items.select('ID', 'RazonSocial', 'Estado', 'Created', 'Author/EMail')
    .expand('Author')
    .getAll();
    response.sort((a, b) => b.ID - a.ID);
    setProveedores(response.slice(0, cantRegistros));
    setTodosLosProveedores(response);
    setProveedoresFiltrados(response);
    CalcularPaginas(response.length);
  };
  const CalcularPaginas = async (totalRegistros)=>{
    const numerador = totalRegistros;
    const denominador = cantRegistros;
    const resultado = numerador / denominador;
    const cocienteRedondeado = Math.ceil(resultado);
    setCantidadPaginas(cocienteRedondeado.toString());
  };
  const resultCountText = proveedores.length === proveedoresFiltrados.length ? '' : ` (${proveedores.length} de ${proveedoresFiltrados.length} registros)`;
  const filtroCambia = (_: any, text: string): void => {
    if(text.toString() !== ''){
    setProveedores(
      proveedoresFiltrados.filter(item => (
        item.RazonSocial && item.RazonSocial.toLowerCase().indexOf(text.toLowerCase()) >= 0
        )
      ).slice(0,cantRegistros)
    );
    CalcularPaginas(proveedores.length);
      }else{
        CargarProveedores();
      }
  };
  const renderProveedor = (item) => {
    const itemCellStyle = {
      cursor: 'pointer',
      minHeight: '54px',
      padding: '10px',
      boxSizing: 'border-box',
      borderTop: `1px solid ${semanticColors.bodyDivider}`,
      borderBottom: `1px solid ${semanticColors.bodyDivider}`,
      display: 'flex',
      borderLeft: `4px solid ${stateColors[item.Estado] || 'transparent'}`, // Color de borde basado en el estado
    };
    const obtenerIniciales = (nombre) => {
      const palabras = nombre.split(' ');
      if (palabras.length > 1) {
        return palabras[0][0].toUpperCase() + palabras[1][0].toUpperCase();
      } else {
        return nombre[0].toUpperCase();
      }
    };
    // Crear una clase CSS dinámica
    const dynamicClass = mergeStyleSets({
      dynamicStyle: itemCellStyle,
    });
    const fechaCrecion = new Date(item.Created).toLocaleDateString();
    const responsableEmail =item.Author.EMail;
    return (
      <div>12
        <div
          className={dynamicClass.dynamicStyle}
          data-is-focusable={true}
          onClick={() => onItemClicked(item.Id)}
        >
          {/* <Image
            className={classNames.itemImage}
            src="https://res.cdn.office.net/files/fabric-cdn-prod_20230815.002/office-ui-fabric-react-assets/fluent-placeholder.svg"
            width={50}
            height={50}
            imageFit={ImageFit.cover}
          /> */}
          <LivePersona upn={responsableEmail}
              template={
                <>
                  <Persona size={PersonaSize.size24} showInitialsUntilImageLoads imageShouldStartVisible
                  imageUrl={`/_layouts/15/userphoto.aspx?username=${responsableEmail}&size=${PersonaSize.size8}`} />
                </>
              }
              serviceScope={props.context.serviceScope}
            />
          {/* <div className={styles.profile}>
            <figure>
            <img
              src={`https://termoelectricajsm.sharepoint.com/sites/PortalProveedoresDesarrollo/_layouts/15/userphoto.aspx?size=L&username=${item.Author.EMail}`}
              onError={(e) => {
                (e.target as any).src = `data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><circle cx='25' cy='25' r='20' fill='#0078D4' /><text x='50%' y='50%' text-anchor='middle' dy='0.3em' font-size='20' font-family='Arial, sans-serif' fill='#FFFFFF'>${obtenerIniciales(item.Author.EMail)}</text></svg>`;
              }}
              alt=""
            />
            </figure>
            
          </div> */}
          <div className={classNames.itemContent}>
            <div className={classNames.itemName}>{item.RazonSocial}</div>
            <div className={classNames.itemIndex}>{`Item ${item.Id}`}</div>
            
          </div>
          <div className={classNames.fechaCreacion}>Creado: {fechaCrecion}</div>
          <Icon
            className={classNames.chevron}
            iconName={getRTL() ? 'ChevronLeft' : 'ChevronRight'}
          />
        </div>
      </div>
    );
  };
  
  const recargarGrilla= () =>{
    setIsPanelOpen(false);
    CargarProveedores(); 
  };
  return (
    <FocusZone direction={FocusZoneDirection.vertical}>
       <DefaultButton 
        text="Nuevo Proveedor" 
        onClick={() => onItemClicked(0)} 
        style={{ backgroundColor: '#0078D4', color: 'white' , border: 'none'}}
        iconProps={NuevaEmision} />
      <TextField
        label={'Filtre por razón social' + resultCountText}
        onChange={filtroCambia}
        styles={getStyles} 
      />
      <List items={proveedores} onRenderCell={renderProveedor}/>
      <Pagination
        currentPage={1}
        totalPages={parseInt(cantidadPaginas)}
        onChange={(page)=>cambiarPagina(page)}
        limiter={5}
        hideFirstPageJump // Optional
        hideLastPageJump // Optional
      />
      <Panel 
        isOpen={isPanelOpen} 
        type={PanelType.large}
        onDismiss={() => setIsPanelOpen(false)}
      >
        <FormABM 
          id={proveedorSeleccionado} 
          recargarGrilla={()=> recargarGrilla()}
          />
      </Panel>
      
    </FocusZone>
  );
};

export default GrillaABM;
