import * as React from 'react';
import { useState, useEffect } from 'react';
import {  Pivot,
          PivotItem, 
          Dropdown, 
          TextField, 
          PrimaryButton,
          DefaultButton, 
          IDropdownOption,
          MessageBar, 
          MessageBarType,
          MessageBarButton,
          Stack,
          IIconProps,
          Icon,
          Separator,
          Dialog, 
          DialogFooter,
          DialogType
        } from '@fluentui/react';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import styles from './EstilosABM.module.scss';
import LogoBanner from './img/TSM.png';
import { sp, IItemAddResult  } from "@pnp/sp/presets/all";
import { IListItemGeneral,IListItemComentarios } from './IListItem'; 
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import * as FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { ListView, IViewField, SelectionMode } from "@pnp/spfx-controls-react/lib/ListView";
import { Label } from 'office-ui-fabric-react';
import { ITheme, mergeStyleSets, getTheme } from '@fluentui/react/lib/Styling';

registerPlugin(FilePondPluginFileValidateType);
interface ProveedorItem {
  Observaciones: string;
  Estado: string;
  CrearUsuario?: string;
  ProveedorNotificado: string;
}

export interface IFormularioREROProps{
  id: string | null;
  recargarGrilla: () => void;
  context: any | null;
}
const theme: ITheme = getTheme();
const { palette, semanticColors, fonts } = theme;
const stateColors = {
  PENDIENTE: palette.yellow,
  RECHAZADO: palette.red,
  APROBADO: palette.green,
};
const stylesSeparador = {
  root: [{
    selectors: {
      '::before': {
        background: '#0078d4',
      },
    }
  }]
};
const pivotItemStyles = {
    // Establece el color del icono aquí
    selectors: {
      '.ms-Pivot-link .ms-Icon': {
        color: 'red', // Cambia este color al que desees
      },
    },
  };
const personeriaOptions = [
  { key: 'Cooperativa', text: 'Cooperativa' },
  { key: 'Física', text: 'Física' },
  { key: 'Jurídica', text: 'Jurídica' },
  { key: 'Soc. de Hecho', text: 'Soc. de Hecho' },
  { key: 'UTE', text: 'UTE' },
  { key: 'Universidad', text: 'Universidad' },
];
const ProveedorPanel: React.FC<IFormularioREROProps> = (props:IFormularioREROProps) => {
  const [idRegistro, setIdRegistro] = useState("");
  const [historialVisible, setHistorialVisible] = useState(false);
  const [aprobacionesVisible, setAprobacionesVisible] = useState(false);
  const [perteneceGrupoUsAv, setPerteneceGrupoUsAv] = useState(false);
  const [estado, setEstado] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [nombreFantasia, setNombreFantasia] = useState("");
  const [cuit, setCuit] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [pagweb, setPagWeb] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [codpostal, setCodPostal] = useState("");
  const [provincia, setProvincia] = useState("");
  const [calle, setCalle] = useState("");
  const [altura, setAltura] = useState("");
  const [depto, setDepto] = useState("");
  const [piso, setPiso] = useState("");
  const [comentario, setComentario] = useState("");
  const [provinciasOpciones, setProvinciasOpciones] = useState([]);
  const [creado, setCreado] = useState("");
  const [crearUsuario, setCrearUsuario] = useState("");
  const [usuarioAvanzadoComentarioCarga, setUsuarioAvanzadoComentarioCarga] = useState([]);
  const [usuarioAvanzadoComentarioAsignado, setUsuarioAvanzadoComentarioAsignado] = useState([]);
  const [dialogComentarios, setDialogComentarios] = useState(true);
  const [detalleComentario, setDetalleComentario] = useState("");
  const [fechaComentario, setFechaComentario] = useState("");
  const [creadoPor, setCreadoPor] = useState("");
  const [ddPersoneria, setDdPersoneria] = useState<IDropdownOption>();
  const [rubrosOptions, setRubrosOptions] = useState<IDropdownOption[]>([]);
  const [ddRubros, setDdRubros] = useState<IDropdownOption[]>([]);
  const [paisesOpciones, setPaisesOpciones] = useState<IDropdownOption[]>([]);
  const [ddPaises, setDdPaises] = useState<IDropdownOption>();
  const [ddProvincias, setDdProvincias] = useState<IDropdownOption>();
  const [comentarioUsuarioAvanzado, setComentarioUsuarioAvanzado] = useState("");
  const [visibleCboProv, setVisibleCboProv] = useState(true);
  const [mostrarGuardar, setMostrarGuardar] = useState(false);
  const [mostrarAnterior, setMostrarAnterior] = useState(false);
  const [mostrarSiguiente, setMostrarSiguiente] = useState(true);
  const [activarDatosContacto, setActivarDatosContacto] = useState(true);
  const [activarAdjuntos, setActivarAdjuntos] = useState(true);
  const [activarHistorial, setActivarHistorial] = useState(true);
  const [activarAprobaciones, setActivarAprobaciones] = useState(true);
  const [activarComentarios, setActivarComentarios] = useState(true);
  const [selectedTab, setSelectedTab] = useState('datosGenerales');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(MessageBarType.error); 
  const [messageVisible, setMessageVisible] = useState(false);
  const [adjuntarArchivos, setAdjuntarArchivos] = useState([]);
  const [cargarArchivos, setCargarArchivos] = useState([]);
  const [cargarHistorial, setCargarHistorial] = useState([]);
  const [cargarComentarios, setCargarComentarios] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [fileToDelete, setFileToDelete] = useState('');
  const _handleChangeComentarios = (changedvalue) => {
    setComentario(changedvalue.target.value);
  };
  const _handleChangeComentariosUsuarioAvanzado = (changedvalue) => {
    setComentarioUsuarioAvanzado(changedvalue.target.value);
  };
  const handleUpdateFiles = (fileItems) => {
    setAdjuntarArchivos(fileItems.map((fileItem) => fileItem.file));
  };
  const onChangePersoneria = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    setDdPersoneria(item);
  };
  const onChangeRubros = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    if (item) {
      let found = false;
      const updatedSelections = ddRubros.slice(); // Clonar el arreglo de selecciones existentes
  
      for (let i = 0; i < updatedSelections.length; i++) {
        if (updatedSelections[i].key === item.key) {
          // Si la opción ya está seleccionada, elimínala de la selección
          updatedSelections.splice(i, 1);
          found = true;
          break;
        }
      }
  
      if (!found) {
        // Si no se encuentra la opción, agrégala a la selección
        updatedSelections.push(item);
      }
  
      setDdRubros(updatedSelections); // Actualizar el estado con las selecciones actualizadas
    }
  };
  const onChangePais = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    setDdPaises(item);
    if(item.key.toString() === 'Argentina'){
      CargarProvincias();
      setVisibleCboProv(true);
    }
    else{
      setVisibleCboProv(false);
    }
  };
  const onChangeProvincia = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    setDdProvincias(item);
  };
  const _RazonSocialCambia = (changedvalue) => {
    setRazonSocial(changedvalue.target.value);
  };
  const _NombreFantasiaCambia = (changedvalue) => {
    setNombreFantasia(changedvalue.target.value);
  };
  const _CuitCambia = (changedvalue) => {
    setCuit(changedvalue.target.value);
  };
  const _EmailCambia = (changedvalue) => {
    setEmail(changedvalue.target.value);
  };
  const _TelefonoCambia = (changedvalue) => {
    setTelefono(changedvalue.target.value);
  };
  const _PaginaWebCambia = (changedvalue) => {
    setPagWeb(changedvalue.target.value);
  };
  const _CiudadCambia = (changedvalue) => {
    setCiudad(changedvalue.target.value);
  };
  const _CodPostalCambia = (changedvalue) => {
    setCodPostal(changedvalue.target.value);
  };
  const _ProvinciaCambia = (changedvalue) => {
    setProvincia(changedvalue.target.value);
  };
  const _CalleCambia = (changedvalue) => {
    setCalle(changedvalue.target.value);
  };
  const _AlturaCambia = (changedvalue) => {
    setAltura(changedvalue.target.value);
  };
  const _DeptoCambia = (changedvalue) => {
    setDepto(changedvalue.target.value);
  };
  const _PisoCambia = (changedvalue) => {
    setPiso(changedvalue.target.value);
  };
  const _UsuarioNotificarComentarioCambia = (items: any[]) => {
    let userarrPA: string[] = [];
    items.forEach(user => {
      userarrPA.push( user.id );
    });
    setUsuarioAvanzadoComentarioAsignado(userarrPA);
  };
  const viewFields: IViewField[] = [
    {
      name: 'name',  // Nombre del campo que contiene los nombres de archivo adjunto
      displayName: 'Nombre del archivo', // Nombre que se mostrará en la columna
      sorting: true,
      minWidth: 100,
      render: (item) => {
        let sSitioURL;
        sp.web.get().then(sitio => {
          sSitioURL = sitio.Url;
        });
        return (
          <a style={{ cursor: 'pointer' }}
            onClick={() => window.open(`https://termoelectricajsm.sharepoint.com/sites/PortalProveedoresDesarrollo/Lists/ABMProveedores/Attachments/${idRegistro}/${item.name}`, '_blank')}
          >
            {item.name}
          </a>
           );
         },
    },
    {
      name: '',
      minWidth: 50,
      render: (item) => {
        return (
          <Icon onClick={() => handleDeleteFile(item.name)} style={{ cursor: 'pointer', color: 'red' }} iconName={'Delete'} />
        );
      },
    },
  ];
  const camposHistorial: IViewField[] =[
    {    
      name: "Descripcion",    
      displayName: "Comentario",    
      isResizable: true,    
      sorting: true,    
      minWidth: 250,    
   },
   {    
      name: "Author",    
      displayName: "Creado por",    
      isResizable: true,    
      sorting: true,    
      minWidth: 120,    
    },
    {    
      name: "Created",    
      displayName: "Fecha y Hora",    
      isResizable: true,    
      sorting: true,    
      minWidth: 120,    
   },
  ];
  const camposListComentarios: IViewField[]=[
    {    
      name: "Comentario",    
      displayName: "Comentario",    
   
      isResizable: true,    
      sorting: true,    
      minWidth: 0,    
      maxWidth: 400   
    },
   {    
     name: "Author",    
     displayName: "Creado por",    
    // linkPropertyName: "c",    
     isResizable: true,    
     sorting: true,    
     minWidth: 0,    
     maxWidth: 150    
   },
   {    
     name: "Created",    
     displayName: "Fecha",    
    // linkPropertyName: "c",    
     isResizable: true,    
     sorting: true,    
     minWidth: 0,    
     maxWidth: 150    
   },
   {    
     name: "Id",    
     displayName: "Ver",    
    // linkPropertyName: "c",    
     isResizable: true,    
     sorting: true,    
     minWidth: 0,    
     maxWidth: 50   ,
     render: (item: any) => {
       const sID= item["Id"] ;
       return   <Icon onClick={()=> VisibleDetalleComentario(sID)} className={styles.verMasComentario} iconName={'ZoomIn'} title="Ver Más" />
     
     }     
   },
  ];
  const dialogContentProps = {
    type: DialogType.largeHeader,
  };
  useEffect(() => {
    const fetchData = async () => {
    cargarCombos();
    setActivarDatosContacto(true);
    setActivarAdjuntos(true);
    setActivarHistorial(true);
    setActivarAprobaciones(true);
    setActivarComentarios(true);
    setEstado('CARGA');
    if(props.id != '0')
    {
      usuarioProveedores();
      CargarDatos(props.id);
      setHistorialVisible(true);
      setMostrarGuardar(true);
      setActivarDatosContacto(false);
      setActivarAdjuntos(false);
      setActivarHistorial(false);
      setActivarAprobaciones(false);
      setMostrarSiguiente(false);
      setActivarComentarios(false);
    }
    else{
      setEstado("PENDIENTE");
    }
    };

  fetchData();
  }, []);
  const VisibleDetalleComentario =async (sID)=>{
    console.log('entro a ver comentarios');
    console.log(sID);
    setDialogComentarios(false);
    await sp.web.lists.getByTitle("ABMProveedoresComentarios").items
    .getById(parseInt(sID))
    .select('Created,Comentario,Author/FirstName,Author/LastName,Author/Id,Id').expand('Author')
    .get().then((item: IListItemComentarios) : void => { 
      setFechaComentario(new Date(item.Created).toLocaleDateString());
      setDetalleComentario(item.Comentario);
      setCreadoPor(item.Author.FirstName + " " + item.Author.LastName,);
     });
  }
  const CerrarComentario = async ()=>{
    setDialogComentarios(true);
  }
  const handleDeleteFile = async (fileName) => {
    setFileToDelete(fileName); // Guarda el nombre del archivo que se va a eliminar
    setShowDeleteConfirmation(true); // Muestra el mensaje de confirmación
  };
  const confirmDelete = async () => {
    await sp.web.lists.getByTitle('ABMProveedores')
      .items.getById(parseInt(idRegistro))
      .attachmentFiles.getByName(fileToDelete)
      .delete();
    
    // Actualiza la lista de archivos adjuntos después de la eliminación
    const updatedArchivos = cargarArchivos.filter(file => file.name !== fileToDelete);
    setCargarArchivos(updatedArchivos);
  
    // Oculta el mensaje de confirmación
    setShowDeleteConfirmation(false);
    setFileToDelete('');
  };
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setFileToDelete('');
  };
  const usuarioProveedores = async()=>{
    let UsuarioProveedoresEncontrado: boolean = false;
    let UsuarioAvanzadoEncontrado: boolean = false;
    let groups = await sp.web.currentUser.groups();
    await Promise.all(groups.map((grupos)=>{
      if(grupos.Title == "ProveedoresTSM"  ){
        UsuarioProveedoresEncontrado = true;
      }
      if(grupos.Title == "UsuariosAvanzadosTSM"  ){
        UsuarioAvanzadoEncontrado = true;
      }
    })).then(()=>{
      if(UsuarioProveedoresEncontrado == true){
        setAprobacionesVisible(true);
      }
      if(UsuarioAvanzadoEncontrado == true){
        setPerteneceGrupoUsAv(true);
      }
    });
  };
  const CargarDatos = async(sId)=>{
    setIdRegistro(sId);
    await sp.web.lists.getByTitle("ABMProveedores").items
    .getById(parseInt(sId))
    .select("Estado,RazonSocial,Cuit,NombreFantasia,Personeria,Rubros,Email,Telefono,PaginaWeb,Pais,Provincia,Ciudad,CodigoPostal,Calle,Altura,Departamento,Piso,Observaciones,Created,CrearUsuario")
    .get().then((item: IListItemGeneral) : void => {  
      let opcionPersoneria : IDropdownOption = {key: item.Personeria, text: item.Personeria};
      let opcionPais : IDropdownOption = {key: item.Pais, text: item.Pais};
      let opcionProvincia : IDropdownOption = {key: item.Provincia, text: item.Provincia};
      let personeriaIguales: boolean;
      var rubrosValue :IDropdownOption[]=[]; 
      item.Rubros.split(',').map((rubro, index) => {
        rubrosValue.push({key:rubro.trim(), text:rubro.trim()})
      });
  // Dividir la cadena de rubros en elementos individuales
  const rubrosArray = 
  console.log('rubrosArray');
  console.log(rubrosArray);
      for (const personeriaOpcion of personeriaOptions) {
        personeriaIguales = false;
        if (personeriaOpcion.key === opcionPersoneria.key) {
          personeriaIguales = true;
          break;
        }
      }
      if(personeriaIguales == false){
        const nuevaOpcion = { key: item.Personeria, text: item.Personeria };
        personeriaOptions.push(nuevaOpcion);
      }
   
      const paisNoExiste = !paisesOpciones.some((paisOpcion) => paisOpcion.key === opcionPais.key);
      if (paisNoExiste) {
        setPaisesOpciones((prevOptions) => [
          ...prevOptions,
          { key: opcionPais.key, text: opcionPais.text },
        ]);
      }
      setCreado(new Date(item.Created).toLocaleDateString());
      setEstado(item.Estado);
      setRazonSocial(item.RazonSocial);
      setNombreFantasia(item.NombreFantasia);
      setCuit(item.Cuit)
      setDdPersoneria(opcionPersoneria);
      setDdRubros(rubrosValue);
      setEmail(item.Email);
      setTelefono(item.Telefono);
      setPagWeb(item.PaginaWeb);
      setDdPaises(opcionPais);
      if(opcionPais.key.toString() === 'Argentina'){
        setVisibleCboProv(true);
      }
      else{
        setVisibleCboProv(false);
      }
      setDdProvincias(opcionProvincia);
      setProvincia(item.Provincia);
      setCiudad(item.Ciudad);
      setCodPostal(item.CodigoPostal);
      setCalle(item.Calle);
      setAltura(item.Altura);
      setDepto(item.Departamento);
      setPiso(item.Piso);
      setComentario(item.Observaciones);
      setCrearUsuario(item.CrearUsuario);
    });
    const item = await sp.web.lists.getByTitle('ABMProveedores')
      .items.getById(parseInt(sId))
      .select('AttachmentFiles')
      .expand('AttachmentFiles')
      .get();
    if (item.AttachmentFiles && item.AttachmentFiles.length > 0) {
      const archivoNames= item.AttachmentFiles.map(file => ({
        id: file.Id,
        name: file.FileName,
      }));
      setCargarArchivos(archivoNames);
    }
    CargarHistorial(props.id);
    CargarComentarios(props.id);
  };
  const CargarHistorial = async (sId) => {
    // const proveedorInfo = await sp.web.lists.getByTitle("ABMProveedores").items
    //   .getById(parseInt(sId))
    //   .select("Created, Author/LastName, Author/FirstName")
    //   .expand("Author")
    //   .get();
      const historialItems = await sp.web.lists.getByTitle("HistorialABMProveedores").items
      .filter(`IdProveedor eq ${sId}`)
      .select("Id, Descripcion, Created, Author/LastName, Author/FirstName")
      .expand("Author")
      .get();
     
    const historial = [];
    historialItems.forEach((historialItem) => {
      const FechaHistorialItem = new Date(historialItem["Created"].toString());
      historial.push({
        Descripcion: historialItem["Descripcion"],
        Created: FechaHistorialItem.toLocaleDateString() + ' ' + FechaHistorialItem.toLocaleTimeString(),
        Author: historialItem.Author.FirstName + " " + historialItem.Author.LastName,
        Id: historialItem["Id"]
      });
    });
  
    historial.sort((a, b) => b.Id - a.Id);
    setCargarHistorial(historial);
  };
  const CargarComentarios = async (sId) => {
    const comentariosItems = await sp.web.lists.getByTitle("ABMProveedoresComentarios").items
    .filter(`IdRelacionado eq ${sId}`)
    .select("Id, Comentario, Created, Author/LastName, Author/FirstName")
    .expand("Author")
    .get();
     
    const comentario = [];
    comentariosItems.forEach((comentarioItem) => {
      const FechaHistorialItem = new Date(comentarioItem["Created"].toString());
      comentario.push({
        Comentario: comentarioItem["Comentario"],
        Created: FechaHistorialItem.toLocaleDateString() + ' ' + FechaHistorialItem.toLocaleTimeString(),
        Author: comentarioItem.Author.FirstName + " " + comentarioItem.Author.LastName,
        Id: comentarioItem["Id"]
      });
    });
  
    comentario.sort((a, b) => b.Id - a.Id);
    setCargarComentarios(comentario);
  };
  const cargarCombos = async () => {
    var itemsComboRubro: IDropdownOption[]=[];
    sp.web.lists.getByTitle("ABMRubros").items.select('Title').getAll().then((items)=>{    
      itemsComboRubro =[];
      items.sort((a, b) => a.Title > b.Title ? 1 : -1);
      items.map((item)=>{  
        itemsComboRubro.push({key:item.Title, text:item.Title});
        });
    }).then(()=> { 
      setRubrosOptions(itemsComboRubro);
      
    });

    var itemsComboPais: IDropdownOption[]=[];
    sp.web.lists.getByTitle("ABM_AuxiliarProveedores").items.filter("Title eq 'Pais'")
    .select('Valor').getAll().then((items)=>{    
      itemsComboPais =[];
      items.map((item)=>{  
        itemsComboPais.push({key:item.Valor, text:item.Valor});
        });
    }).then(()=> { 
      setPaisesOpciones(itemsComboPais);
    });
    CargarProvincias();
  };
  const CargarProvincias = async ()=>{
    const provinciasLista = sp.web.lists.getByTitle('ABM_AuxiliarProveedores');
    const provinciasItem = await provinciasLista.items
      .filter("Title eq 'Provincia'")
      .select('Valor')
      .get();
    const provincias = provinciasItem.map(item => ({ key: item.Valor, text: item.Valor }));
    setProvinciasOpciones(provincias);
  };
  const pestaniaAnterior = (activeTabIndex) => {
    setMessageVisible(false); 
    switch (activeTabIndex) {
      case 'datosContacto':
        setActivarDatosContacto(true);
        setSelectedTab('datosGenerales');
        setMostrarAnterior(false);
        setMostrarSiguiente(true);
      break;
      case 'adjuntos':
        setActivarAdjuntos(true);
        setActivarDatosContacto(false);
        setSelectedTab('datosContacto');
        setMostrarSiguiente(true);
        setMostrarGuardar(false);
      break;
    }
  };
  const pestaniaSiguiente = (activeTabIndex) => {
    let incompleteFields = [];
    switch (activeTabIndex) {
      case 'datosGenerales':
       // validaDatosGenerales();
        if (razonSocial.trim() === '') {
          incompleteFields.push('Razón Social');
        }
        if (nombreFantasia.trim() === '') {
          incompleteFields.push('Nombre de Fantasía');
        }
        if (!ddPersoneria || ddPersoneria.key === undefined) {
          incompleteFields.push('Personería');
        }
        // if (!ddRubros || ddRubros.key === undefined) {
        //   incompleteFields.push('Rubros');
        // }
  
        if (incompleteFields.length === 0) {
          incompleteFields.push('');
          setMessageVisible(false); 
          setActivarDatosContacto(false);
          setSelectedTab('datosContacto');
          setMostrarAnterior(true);
        } else {
          const fieldsMessage = incompleteFields.join(', ');
          setMessage(`Por favor, completa los siguientes campos: ${fieldsMessage}`);
          setMessageType(MessageBarType.error);
          setMessageVisible(true);
          setActivarDatosContacto(true);
          setSelectedTab('datosGenerales');
        }
        break;
      case 'datosContacto':
        if (email.trim() === '') {
          incompleteFields.push('Dirección de e-mail');
        }
        if (telefono.trim() === '') {
          incompleteFields.push('Teléfono');
        }
        if (pagweb.trim() === '') {
          incompleteFields.push('Pagina Web');
        }
        if (!ddPaises || ddPaises.key === undefined) {
          incompleteFields.push('País');
        }
        if (visibleCboProv === true) {
          if (!ddProvincias || ddProvincias.key === undefined) {
            incompleteFields.push('Provincia');
          }
        } else {
          if (provincia.trim() === '') {
            incompleteFields.push('Provincia');
          }
        } 
        if (ciudad.trim() === '') {
          incompleteFields.push('Ciudad');
        }
        if (codpostal.trim() === '') {
          incompleteFields.push('Cod. Postal');
        }
        if (calle.trim() === '') {
          incompleteFields.push('Calle');
        }
        if (altura.trim() === '') {
          incompleteFields.push('Altura');
        }
        if (depto.trim() === '') {
          incompleteFields.push('Depto');
        }
        if (piso.trim() === '') {
          incompleteFields.push('Piso');
        }
        if (incompleteFields.length === 0) {
          incompleteFields.push('');
          setMessageVisible(false); 
          setActivarAdjuntos(false);
          setSelectedTab('adjuntos');
          setMostrarSiguiente(false);
          setMostrarGuardar(true);
          setMostrarAnterior(true);
        } else {
          const fieldsMessage = incompleteFields.join(', ');
          setMessage(`Por favor, completa los siguientes campos: ${fieldsMessage}`);
          setMessageType(MessageBarType.error);
          setMessageVisible(true);
          setActivarAdjuntos(true);
          setActivarDatosContacto(false);
          setSelectedTab('datosContacto');
        }
        break;
        case 'adjuntos':
          setMessage("Estás en la pestaña Datos Contacto");
          // Aquí puedes realizar acciones específicas para esta pestaña
          break;
      default:
        setMessageVisible(true); 
        setMessage('Estás en una pestaña no identificada');
        setMessageType(MessageBarType.error);
    }
  };
  const clickPestaña = async (item?: PivotItem, ev?: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (item && item.props && item.props.itemKey && props.id != '0') {
      setSelectedTab(item.props.itemKey);
    }
   
  };
  const GuardarDatos = async () => {
    const list = sp.web.lists.getByTitle('ABMProveedores');
    let provinciaForm=null;
      if(visibleCboProv === true){
        provinciaForm= ddProvincias.text;
      }
      else {
        provinciaForm= provincia;
      }
      const selectedRubrosText = ddRubros.map(option => option.text).join(', ');
    if(props.id == '0')
    {
      if (adjuntarArchivos.length > 0) {
        setMessageVisible(false);
        setMessage(null);
      // Agregar el registro con los datos
      
      const registroNuevo = await list.items.add({
        Estado: 'PENDIENTE',
        Title: 'Proveedor',
        RazonSocial: razonSocial,
        NombreFantasia: nombreFantasia,
        Email: email,
        Telefono: telefono,
        PaginaWeb: pagweb,
        Ciudad: ciudad,
        CodigoPostal:codpostal,
        Calle:calle,
        Altura: altura,
        Departamento:depto,
        Piso: piso,
        Personeria: ddPersoneria.text,
        Rubros: selectedRubrosText,
        Pais: ddPaises.text,
        Provincia: provinciaForm,
      });
      // Adjuntar el archivo al registro creado
      for (const file of adjuntarArchivos) {
        await list.items.getById(registroNuevo.data.Id).attachmentFiles.add(file.name, file);
      }
      setMessageVisible(true);
      setMessage('Registro agregado exitosamente con el Id: ' + registroNuevo.data.Id.toString());
      } 
      else 
      {
        setMessageVisible(true);
        setMessage("Por favor, adjunte al menos con un archivo");
      }
    }
    else {
   
      if (adjuntarArchivos.length > 0) {
        for (const file of adjuntarArchivos) {
            await list.items.getById(parseInt(props.id)).attachmentFiles.add(file.name, file);
        };
      };
  
        await list.items.getById(parseInt(props.id)).update({
          RazonSocial: razonSocial,
          NombreFantasia: nombreFantasia,
          Email: email,
          Telefono: telefono,
          PaginaWeb: pagweb,
          Ciudad: ciudad,
          CodigoPostal: codpostal,
          Calle: calle,
          Altura: altura,
          Departamento: depto,
          Piso: piso,
          Personeria: ddPersoneria.text,
          Rubros: selectedRubrosText,
          Pais: ddPaises.text,
          Provincia: provinciaForm,
        });
        if(aprobacionesVisible == true){
          await list.items.getById(parseInt(props.id)).update({
            Estado: 'PENDIENTE',
            ProveedorNotificado: 'NO', 
          });
        }
        await sp.web.lists.getByTitle('HistorialABMProveedores').items.add({
          Descripcion: 'El formulario fue editado',
          IdProveedor: props.id.toString()
        });
        if(aprobacionesVisible === true ){
          await list.items.getById(parseInt(props.id)).update({
            Estado: 'PENDIENTE',
          });
          await sp.web.lists.getByTitle('HistorialABMProveedores').items.add({
            Descripcion: 'El estado ha cambiado a PENDIENTE',
            IdProveedor: props.id.toString()
          });
          
        }
        setMessageVisible(true);
        setMessage('Registro actualizado exitosamente con el Id: ' + props.id);
    //  }
      
      
    }
    props.recargarGrilla();
  };
  const GuardarComentario = async()=>{
    if (!comentarioUsuarioAvanzado) {
      // Comentario es nulo o vacío, muestra una alerta o toma otra acción
      setMessageVisible(true); 
        setMessage('El campo de comentario no puede estar vacío.');
        setMessageType(MessageBarType.error);
      return; // No continuar con el guardado si el comentario está vacío
    }
    setMessageVisible(false); 
    setMessage('');
    await sp.web.lists.getByTitle('ABMProveedoresComentarios').items.add({
      Title: 'Comentario',
      Comentario: comentarioUsuarioAvanzado,
      IdRelacionado: props.id.toString(),
      NotificarAId: { results: usuarioAvanzadoComentarioAsignado } ,
    });
    setComentarioUsuarioAvanzado("");
    CargarComentarios(props.id);
  }
  const AprobarRechazar = async (respuesta) =>{
    setMessageVisible(false);
    if (respuesta === 'RECHAZADO' && (!comentario || comentario.trim() === '')) {
      setMessage('Por favor, ingrese un comentario');
      setMessageType(MessageBarType.error);
      setMessageVisible(true);
      return;
    }
    let historialDescripcion = 'El formulario fue ' + respuesta;
  if (comentario && comentario.trim() !== '') {
    historialDescripcion += ' con el siguiente comentario: ' + comentario;
  }
  // await sp.web.lists.getByTitle('ABMProveedores').items.getById(parseInt(props.id)).update({
  //     Observaciones: comentario,
  //     Estado: respuesta,
  //   });
    
  //   if(crearUsuario == "NO"){
  //     await sp.web.lists.getByTitle('ABMProveedores').items.getById(parseInt(props.id)).update({
  //       CrearUsuario:'SI',
  //     });
  //   };
  const itemToUpdate: ProveedorItem = {
    Observaciones: comentario,
    Estado: respuesta,
    ProveedorNotificado: 'NO', 
  };
  
  // if (crearUsuario === "NO") {
  //   itemToUpdate.CrearUsuario = 'SI';
  // }
  
  await sp.web.lists.getByTitle('ABMProveedores').items.getById(parseInt(props.id)).update(itemToUpdate);
  
  
    await sp.web.lists.getByTitle('HistorialABMProveedores').items.add({
      Descripcion: historialDescripcion,
      IdProveedor: props.id.toString()
    });
    props.recargarGrilla();
  };
  const cerrar = async () => {
    props.recargarGrilla();
  };
  
  const comentarioIcon: IIconProps = { iconName: 'Comment'};
  const aprobar: IIconProps = { iconName: 'CheckMark'};
  const rechazar: IIconProps = { iconName: 'Cancel' };
  const ZoomIn: IIconProps = { iconName: 'ZoomIn' };
  return (
    <div style={{ padding: '20px' }}>
      <div className={styles.header}>
      <img src={LogoBanner} id="isologoNS" alt="Logo TSM" className={styles.logoTSM}/>
      </div>
      
      <Stack horizontal styles={{ root: { paddingTop: '10px' } }}>
        <Stack.Item grow>
          <Label styles={{ root: { float: 'left', marginRight: '5px',} }}>ID: </Label>
          <Label  styles={{ root: { color: '#0078d4',} }}>{props.id}</Label>
          <Label styles={{ root: {float: 'left', marginRight: '5px',} }}>CREADO: </Label>
          <Label  styles={{ root: { color: '#0078d4',} }}>{creado}</Label>
        </Stack.Item>
        <Stack.Item grow>
          <Stack horizontalAlign='end'>
            <Label><span style={{ marginRight:'5px' }}>ESTADO: </span>
            <Label styles={{ root: { display:'contents', width:'100px', marginLeft: '10px' , border: 'none',color: stateColors[estado],} }}>{estado}</Label></Label>
          </Stack>
        </Stack.Item>
      </Stack>
      <Separator styles={stylesSeparador}></Separator>
       <Pivot selectedKey={selectedTab} onLinkClick={clickPestaña} > 
        <PivotItem 
          headerText="Datos Generales" 
          itemKey='datosGenerales' 
          itemIcon="FileTemplate"
        >
        <Stack horizontal tokens={{ childrenGap: 20 }}>
          <Stack.Item grow>
            <TextField 
              label="Razón Social" 
              value={razonSocial} 
              onChange={_RazonSocialCambia}
            />
            <Dropdown
              placeholder="Personería"
              label="Personería"
              options={personeriaOptions}
              selectedKey={ddPersoneria ? ddPersoneria.key : undefined}
              onChange={onChangePersoneria}
            />
            <TextField 
              label="CUIT" 
              value={cuit} 
              onChange={_CuitCambia}
              readOnly={true}
            />
          </Stack.Item>
          <Stack.Item grow>
            <TextField 
              label="Nombre de fantasía" 
              value={nombreFantasia} 
              onChange={_NombreFantasiaCambia}
            />
            <Dropdown
              placeholder="Rubros"
              label="Rubros"
              options={rubrosOptions}
              selectedKeys={ddRubros.map(option => option.key.toString())}
              onChange={onChangeRubros}
              multiSelect
            />
          </Stack.Item>
        </Stack>
        </PivotItem>
        <PivotItem headerText="Datos Contacto"  itemKey='datosContacto'
          headerButtonProps={{
          'disabled': activarDatosContacto,
          }}
          itemIcon="Contact"
        >
          <Stack tokens={{ childrenGap: 20 }}>
          <TextField 
            label="Dirección de e-mail" 
            value={email} 
            onChange={_EmailCambia}
          />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 20 }} style={{ marginTop: 0 }}>
            <TextField 
              label="Teléfono" 
              value={telefono} 
              className={styles.width50}
              onChange={_TelefonoCambia}
            />
            <TextField 
              label="Pagina Web" 
              value={pagweb} 
              className={styles.width50}
              onChange={_PaginaWebCambia}
            />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 20 }} style={{ marginTop: 0 }}>
            <Dropdown
              placeholder="Pais"
              label="Pais"
              options={paisesOpciones}
              selectedKey={ddPaises ? ddPaises.key : undefined}
              onChange={onChangePais}
              className={styles.width50}
            />
            {visibleCboProv === true ? (
              <Dropdown
                placeholder="Provincia"
                label="Provincia"
                options={provinciasOpciones}
                selectedKey={ddProvincias ? ddProvincias.key : undefined}
                onChange={onChangeProvincia}
                className={styles.width50}
              />
            ) : (
              <TextField 
                label="Provincia" 
                value={provincia} 
                className={styles.width50}
                onChange={_ProvinciaCambia}
              />
            )}
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 20 }} style={{ marginTop: 0 }}>
            <TextField 
              label="Ciudad" 
              value={ciudad} 
              className={styles.width50}
              onChange={_CiudadCambia}
            />
            <TextField 
              label="Cod. Postal" 
              value={codpostal} 
              className={styles.width50}
              onChange={_CodPostalCambia}
            />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 20 }} style={{ marginTop: 0 }}>
            <TextField 
              label="Calle" 
              value={calle} 
              className={styles.width50}
              onChange={_CalleCambia}
            />
            <TextField 
              label="Altura" 
              value={altura} 
              className={styles.width15}
              onChange={_AlturaCambia}
            />
            <TextField 
              label="Depto" 
              value={depto} 
              className={styles.width15}
              onChange={_DeptoCambia}
            />
            <TextField 
              label="Piso" 
              value={piso} 
              className={styles.width15}
              onChange={_PisoCambia}
            />
          </Stack>
        </PivotItem>
        <PivotItem headerText="Adjuntos"  itemKey='adjuntos'
          headerButtonProps={{
            'disabled': activarAdjuntos,
            }}
            itemIcon="Attach"
          >
          <FilePond
            files={adjuntarArchivos}
            onupdatefiles={handleUpdateFiles}
            acceptedFileTypes={['application/pdf']}
            allowMultiple={true}
            labelIdle='Puede arrastrar sus documentos o <span class="filepond--label-action">buscarlos</span>'
          />
           <ListView
            items={cargarArchivos} // El array de archivos adjuntos
            viewFields={viewFields}
            selectionMode={SelectionMode.none}
          />
        </PivotItem>
        {historialVisible && (
          <PivotItem headerText="Historial"  itemKey='historial'
            headerButtonProps={{
              'disabled': activarHistorial,
            }}
            itemIcon="History"
          >
            <ListView
              items={cargarHistorial} // El array de archivos adjuntos
              viewFields={camposHistorial}
              selectionMode={SelectionMode.none}
            />
          </PivotItem>
        )}
        {perteneceGrupoUsAv && (
          <PivotItem headerText="Aprobaciones"  itemKey='aprobaciones'
            headerButtonProps={{
              'disabled': activarAprobaciones,
            }}
            itemIcon="CheckMark"
          >
            <TextField
              id='txtComentarios' 
              placeholder='Comentarios' 
              onChange={_handleChangeComentarios}   
              value={comentario} 
              multiline 
              rows={5}  
            />
            <Stack horizontal style={{ marginTop: 15, justifyContent: 'center' }}>
              <DefaultButton iconProps={aprobar} text="Aprobar" className={styles.botonAceptar} onClick={()  =>AprobarRechazar('APROBADO')}/>
              <DefaultButton iconProps={rechazar} text="Rechazar" className={styles.botonRechazar} onClick={() =>AprobarRechazar('RECHAZADO')}/>
            </Stack>
          </PivotItem>
        )}
        {perteneceGrupoUsAv && (
          <PivotItem headerText="Comentarios"  itemKey='comentarios'
            headerButtonProps={{
              'disabled': activarComentarios,
            }}
            itemIcon="Comment"
          >
            {cargarComentarios.length === 0 ? (
              <MessageBar
                messageBarType={MessageBarType.info} // Puedes ajustar el tipo de mensaje según tus necesidades
                isMultiline={false}
              >
                No se realizaron comentarios aún.
              </MessageBar>
            ) : (
              <ListView
                items={cargarComentarios}
                viewFields={camposListComentarios}
                selectionMode={SelectionMode.none}
              />
            )}
            <TextField
              id='txtComentarios' 
              placeholder='Comentarios' 
              onChange={_handleChangeComentariosUsuarioAvanzado}   
              value={comentarioUsuarioAvanzado} 
              multiline 
              rows={5}  
            />

            <PeoplePicker 
              context={props.context}
              titleText="Notificar a"
              placeholder='Ingrese usuario'
              personSelectionLimit={1} 
              defaultSelectedUsers ={usuarioAvanzadoComentarioCarga}
              showtooltip={true}  
              disabled={false}  
              onChange={_UsuarioNotificarComentarioCambia}
              ensureUser={true}  
              principalTypes={[PrincipalType.User]}  
              resolveDelay={1000}
            />
            <Stack horizontal style={{ marginTop: 15, justifyContent: 'center' }}>
              <DefaultButton iconProps={comentarioIcon} text="Comentar" className={styles.botonAceptar} onClick={()  => GuardarComentario()}/>
            </Stack>
            <Dialog
              hidden={dialogComentarios}
            >
              <strong>  <Icon aria-label="Compass" iconName="Comment"  /><label className={styles.tituloDialogComentario}> Detalle comentario</label> </strong>
              <Separator styles={stylesSeparador}  ></Separator>
              <label className={styles.tituloDialogComentario}><strong>Fecha comentario:</strong></label>
              <label > {fechaComentario}</label> 
              <br></br>
              <label className={styles.tituloDialogComentario}><strong>Creado por:</strong></label>
              <label > {creadoPor}</label> 
              <br></br>
              <label className={styles.tituloDialogComentario}><strong>Comentario </strong></label> 
              <br></br>
              <label >
              {detalleComentario}</label>
              
              <DialogFooter>
                <DefaultButton  onClick={() => CerrarComentario()} text="Cerrar" />
              </DialogFooter>
            </Dialog>
          </PivotItem>
        )}
      </Pivot>
      {messageVisible && (
        <MessageBar messageBarType={messageType} isMultiline={false}>
          {message}
        </MessageBar>
      )}
      {showDeleteConfirmation && (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
          ¿Estás seguro de que deseas eliminar el archivo "{fileToDelete}"? 
          <MessageBarButton onClick={confirmDelete}>SI</MessageBarButton>
          <MessageBarButton onClick={cancelDelete}>NO</MessageBarButton>
        </MessageBar>
      )}

      <Stack horizontal style={{ marginTop: 15 }}>
        { mostrarAnterior === true && <PrimaryButton text="Anterior"  onClick={() => pestaniaAnterior(selectedTab)} style={{ width: '100%' }} />}
        { mostrarSiguiente === true && <PrimaryButton text="Siguiente"  onClick={() => pestaniaSiguiente(selectedTab)} style={{ width: '100%' }} />}
        { mostrarGuardar === true && <PrimaryButton text="Guardar" style={{ width: '100%' }} onClick={GuardarDatos} />}
        <PrimaryButton text="Cerrar" className={styles.botonCerrar} onClick={cerrar} style={{ width: '100%' }} />
      </Stack>
    </div>
  );
};

export default ProveedorPanel;