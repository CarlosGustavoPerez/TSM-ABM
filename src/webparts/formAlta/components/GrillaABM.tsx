import * as React from 'react';
import styles from './EstilosABM.module.scss';
import { useState, useEffect } from 'react';
import { DefaultButton, Persona, PersonaSize,FocusZone, FocusZoneDirection,Panel,PanelType,MessageBar,IIconProps,ITextFieldStyleProps, ITextFieldStyles, ILabelStyles, ILabelStyleProps,  } from '@fluentui/react';
import { Pagination } from '@pnp/spfx-controls-react/lib/pagination';
import { getRTL } from '@fluentui/react/lib/Utilities';
import { TextField } from '@fluentui/react/lib/TextField';
import { Icon } from '@fluentui/react/lib/Icon';
import { List } from '@fluentui/react/lib/List';
import { ITheme, mergeStyleSets, getTheme } from '@fluentui/react/lib/Styling';
import { sp } from "@pnp/sp/presets/all";
import FormABM from './FormABM';
import  { LivePersona } from "@pnp/spfx-controls-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface IMasterABMProps {
  registrosPorPagina:string;
  context: any | null;
  VerSoloCreadoPor:string;
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
    usuarioProveedores();
    CargarProveedores();
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let IdSolicitud = params.get('IdSolicitud');
    if(IdSolicitud != null)
    {
      abrirFormulario(IdSolicitud);
    }

  }, []);
  const abrirFormulario = async (sId) =>{
    setProveedorSeleccionado(sId);
    setIsPanelOpen(true);
  };
  const usuarioProveedores = async()=>{
    let UsuarioAvanzadoEncontrado: boolean = false;
    let groups = await sp.web.currentUser.groups();
    await Promise.all(groups.map((grupos)=>{
      
      if(grupos.Title == "UsuariosAvanzadosTSM"  ){
        UsuarioAvanzadoEncontrado = true;
      }
    })).then(()=>{
      
      if(UsuarioAvanzadoEncontrado == true){
        setPerteneceGrupoUsAv(true);
      }
    });
  };
  const [cantRegistros, setCantRegistros] = useState(10);
  const [proveedores, setProveedores] = useState([]);
  const [todosLosProveedores, setTodosLosProveedores] = useState([]);
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [cantidadPaginas, setCantidadPaginas] = useState("1");
  const [perteneceGrupoUsAv, setPerteneceGrupoUsAv] = useState(false);

  const iconoExcel: IIconProps = { iconName: 'ExcelLogoInverse' };
  const cambiarPagina = async (page: number): Promise<void> => {
    const irApagina= Math.ceil(page);
    setProveedores(todosLosProveedores.slice(((irApagina-1)*cantRegistros), irApagina*cantRegistros));
  };
  const onItemClicked = async (item) => {
    setProveedorSeleccionado(item);
    setIsPanelOpen(true);
  };
  const CargarProveedores = async () => {
    let response=null;
    if(props.VerSoloCreadoPor=="SI")
    {
      let UserId;
      UserId =await (await sp.web.currentUser.get()).Id;
      response = await sp.web.lists
      .getByTitle('ABMProveedores')
      .items.filter("Author/Id eq '" + UserId+ "'").select('ID', 'RazonSocial', 'Estado', 'Created', 'Author/EMail')
      .expand('Author')
      .getAll();
    }
    else
    {
      response = await sp.web.lists
      .getByTitle('ABMProveedores')
      .items.select('ID', 'RazonSocial', 'Estado', 'Created', 'Author/EMail')
      .expand('Author')
      .getAll();
    }
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
    // Crear una clase CSS dinámica
    const dynamicClass = mergeStyleSets({
      dynamicStyle: itemCellStyle,
    });
    const fechaCrecion = new Date(item.Created).toLocaleDateString();
    const responsableEmail =item.Author.EMail;
    return (
      <div>
        <div
          className={dynamicClass.dynamicStyle}
          data-is-focusable={true}
          onClick={() => onItemClicked(item.Id)}
        >
          <LivePersona upn={responsableEmail}
              template={
                <>
                  <Persona size={PersonaSize.size24} showInitialsUntilImageLoads imageShouldStartVisible
                  imageUrl={`/_layouts/15/userphoto.aspx?username=${responsableEmail}&size=${PersonaSize.size8}`} />
                </>
              }
              serviceScope={props.context.serviceScope}
            />
          <div className={classNames.itemContent}>
            <div className={classNames.itemName}>{item.RazonSocial}</div>
            <div className={classNames.itemIndex}>{`ID: ${item.Id}`}</div>
            
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
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';  
  const fileExtension = '.xlsx';  
  var Heading = [["Id", "Razon Social","Cuit","Nombre Fantasia","Personería","Rubros","Dirección de e-mail","Teléfono","Pagina Web","País","Provincia","Ciudad","Cod. Postal","Calle","Altura","Depto","Piso"]];  
  const ExportarRegistros = async () => {
    const RegistrosABMProveedores = await sp.web.lists.getByTitle("ABMProveedores").items
      .select('Id,RazonSocial,Cuit,NombreFantasia,Personeria,Rubros,Email,Telefono,PaginaWeb,Pais,Provincia,Ciudad,CodigoPostal,Calle,Altura,Departamento,Piso')
      .get();

    const RegistrosProveedores = RegistrosABMProveedores.map(proveedor => ({
      Id: proveedor.Id,
      RazonSocial: proveedor.RazonSocial,
      Cuit:proveedor.Cuit,
      NombreFantasia: proveedor.NombreFantasia,
      Personeria: proveedor.Personeria,
      Rubros: proveedor.Rubros,
      Email: proveedor.Email,
      Telefono: proveedor.Telefono,
      PaginaWeb: proveedor.PaginaWeb,
      Pais: proveedor.Pais,
      Provincia: proveedor.Provincia,
      Ciudad: proveedor.Ciudad,
      CodigoPostal: proveedor.CodigoPostal,
      Calle: proveedor.Calle,
      Altura: proveedor.Altura,
      Departamento: proveedor.Departamento,
      Piso: proveedor.Piso,
    }));

    const ws = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, RegistrosProveedores, { origin: 'A2', skipHeader: true });

    const wb = { Sheets: { 'ExportacionProveedores': ws }, SheetNames: ['ExportacionProveedores'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, 'ExportacionProveedores' + fileExtension);
  };

  return (
    
    <FocusZone direction={FocusZoneDirection.vertical}>
      {perteneceGrupoUsAv && (
        <div className={styles.divBarraSuperior}>
          <DefaultButton className={styles.btnExcel} iconProps={iconoExcel} onClick={() => ExportarRegistros()} ariaDescription="Exportar" >Exportar</DefaultButton>
        </div>
      )}
      <TextField
          label={'Filtre por razón social' + resultCountText}
          onChange={filtroCambia}
          styles={getStyles} 
        />
      {proveedores.length === 0 ? (
        <MessageBar>
        No existen registros.
      </MessageBar>
      
        ) : (
    <div>
      
        
        
      <List items={proveedores} onRenderCell={renderProveedor} />
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
          recargarGrilla={()=> recargarGrilla()
          }
          context={props.context}
          />
      </Panel>
      </div>
      )}
    </FocusZone>
  );
};

export default GrillaABM;
