define(function () 
{
    this.jsonData = {};

    this.Initialize = e =>
    {        
        var form = document.getElementById('llenadoForm');
        form.addEventListener('submit', OnFormSubmit);

        obtenerInformacion();
    }

    let obtenerInformacion = () =>
    {
        let httpRequest = require('./request');
        httpRequest.ObtenerJSONData('registros', OnHttpRequestObtenerDone);
    }

    let OnHttpRequestObtenerDone = data =>
    {
        this.jsonData = data;
        let objetos = this.jsonData['ponentes'];
        console.log(objetos);

        objetos.forEach(function(objeto, index) {
            setNewSeccionDeObjetoEncontrado(objeto, index);
        });

        run();
    }    

    let setNewSeccionDeObjetoEncontrado = (objeto, index) =>
    {
        let fieldSet = document.createElement('fieldset');
        fieldSet.classList.add('fieldset-objeto');
        fieldSet.appendChild(setTituloDeSeccion(objeto));
        fieldSet = setFormularioObjeto(objeto, fieldSet, index);

        document.getElementById('llenadoForm').insertBefore(fieldSet, document.getElementById('llenadoDefault'));
    }

    let setTituloDeSeccion = (objeto) =>
    {
        let titulo = objeto.nombre;
        let pElement = document.createElement('p');
        pElement.innerHTML = titulo;
        pElement.classList.add('seccion-titulo');
        return pElement; 
    }


    let setFormularioObjeto = (objeto, fieldSet, index) =>
    {
        for(key in objeto)
        {
            console.log(typeof objeto[key]);
            if(typeof objeto[key] === 'object')
            {
                for(subKey in objeto[key])
                {
                    fieldSet = setFieldSetSeccion(subKey, objeto, fieldSet, index);
                }
            }
            else
            {
                fieldSet = setFieldSetSeccion(key, objeto, fieldSet, index);
            }
            
        }

        return fieldSet;
    }

    let setFieldSetSeccion = (key, objeto, fieldSet, index) =>
    {
        var seccion = document.createElement('section');        

        var idObjeto = 'i' + key.capitalizeFirstLetter() + '_' + index;
        var label = document.createElement('label');
        label.setAttribute('for', idObjeto);
        label.textContent = key.capitalizeFirstLetter();
        seccion.appendChild(label);
        
        if(key === 'biografia' || key === 'texto')
            seccion.appendChild(setTextareaElement(key, idObjeto, objeto, index));
        else
            seccion.appendChild(setInputElement(key, idObjeto, objeto, index));
        
        fieldSet.appendChild(seccion);

        return fieldSet;
    }

    let setInputElement = (key, idObjeto, objeto, index) =>
    {
        var inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'text');
        //inputElement.setAttribute('id', idObjeto);
        if(key === 'id')
        {
            inputElement.setAttribute('name', 'id' + '_' + index);
            var valor = objeto[key] === undefined ? '' : objeto[key];
            
            if(valor === undefined)
            {
                inputElement.value = '';
            }
            else
            {
                valor = valor.split('_')[1];
                inputElement.value = valor;
            }
        }
        else
        {
            inputElement.setAttribute('name', key + '_' + index);
            inputElement.value = objeto[key] === undefined ? '' : objeto[key];
        }
        
        
        return inputElement;
    }

    let setTextareaElement = (key, idObjeto, objeto, index) =>
    {
        var inputElement = document.createElement('textarea');
        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('id', idObjeto);
        inputElement.classList.add('widgEditor');
        inputElement.setAttribute('name', key + '_' + index);
        inputElement.value = objeto[key] === undefined ? '' : objeto[key];
        return inputElement;
    }

    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    let agregarDivConElContenidoFacturadoPorMes = (mes, facturadoObject) =>
    {                
        subTotalPorMes = 0;
        totalPorMes = 0;

        let div = document.createElement('div');
        div.classList.add('facturas-mes');

        div.appendChild(nuevoObjetoConTexto("Mes: " + mes, 'mes-text'));

        div = obtenerValoresFacturadosDeTipo('recibido', facturadoObject, div);
        div = obtenerValoresFacturadosDeTipo('gastado', facturadoObject, div);

        let container = document.getElementById('resultados');

        totalPorAnio += totalPorMes;
        subTotalPorAnio += subTotalPorMes;

        container.appendChild(div);
        container.appendChild(nuevoObjetoConTexto("Subtotal: " + subTotalPorMes, 'total-mes-text'));
        container.appendChild(nuevoObjetoConTexto("Total: " + totalPorMes, 'total-mes-text'));
    }

    let obtenerValoresFacturadosDeTipo = (tipo, facturadoObject, div) =>
    {
        div.appendChild(nuevoObjetoConTexto(tipo, 'mes-tipo-text'));

        for(var l = 0; l < facturadoObject[tipo]['facturas'].length; ++l)
        {
            let facturaObject = facturadoObject[tipo]['facturas'][l];     

            if(facturaObject.cantidad === "")
                continue;    

            let propiedades = ['cantidad', 'iva', 'ivaretenido', 'isrretenido'];

            for(var k = 0; k < propiedades.length; ++k)
                div.appendChild(nuevoObjetoConTexto(facturaObject[propiedades[k]], 'contenido-text'));

            let subTotal = Number(facturaObject.cantidad) + Number(facturaObject.iva);
            let ivaRetenido = Number(facturaObject.ivaretenido);
            let isrRetenido = Number(facturaObject.isrretenido);
            let totalFactura = subTotal - ivaRetenido - isrRetenido;

            if(tipo === 'recibido')
            {
                subTotalPorMes += subTotal;
                totalPorMes += totalFactura;
            }
            else if(tipo === 'gastado')
            {
                subTotalPorMes -= subTotal;
                totalPorMes -= totalFactura;                
            }

            div.appendChild(nuevoObjetoConTexto("Subtotal: " + subTotal, 'total-text'));
            div.appendChild(nuevoObjetoConTexto("Total: " + totalFactura, 'total-text'));

            div.appendChild(nuevoObjetoConTexto(facturaObject['idfactura'], 'folio-text'));
                            
        }

        return div;
    }

    let nuevoObjetoConTexto = (texto, clase) =>
    {
        let pObjeto = document.createElement('p');
        pObjeto.innerHTML = texto;
        pObjeto.classList.add(clase);
        return pObjeto;   
    }

    let OnFormSubmit = evento =>
    {
        console.log('submit');
        evento.preventDefault();

        agregarInformacionAlRegistro();

        return false;
    }

    let objetosGuardar = {};
    objetosGuardar.ponentes = [];

    let agregarInformacionAlRegistro = () =>
    {         
        var elementos = document.getElementsByClassName('fieldset-objeto');
        for(var i = 0; i < elementos.length; ++i)
        {
            agregarObjetoActualizar(elementos[i]);
        }
        
        var inputCheck = document.getElementById('iAgregar');
        if(inputCheck.checked)
            agregarObjetoNuevo();

        this.jsonData = objetosGuardar;
        salvarInformacion();
    }

    let agregarObjetoActualizar = fieldSet =>
    {
        var objetoEditar = {};
        for(var i = 0; i < fieldSet.childNodes.length; ++i)
        {
            var child = fieldSet.childNodes[i];
            if(child.classList.contains('seccion-titulo')) continue;

            var idCompleto = child.childNodes[0].getAttribute('for');
            var idGeneral = idCompleto.split('_')[0];
            var input = child.childNodes[1];
            
            if(idGeneral === 'iBiografia' || idGeneral == 'iTexto')
                objeto = getValorEnTextarea(idGeneral, objetoEditar);
            else
                objeto = getValorEnCampo(input, objetoEditar);
        }

        var objetoCompendio = {};
        var objetoPonente = {};
        for(key in objetoEditar)
        {
            if(key === 'texto' || key === 'titulo')
            {
                objetoCompendio[key] = objetoEditar[key];                
            }
            else
            {
                objetoPonente[key] = objetoEditar[key];
            }
        }

        objetoPonente['ponencia'] = objetoCompendio;

        objetosGuardar.ponentes.push(objetoPonente);
    }

    let getValorEnCampo = (elemento, objetoEditar, index) =>
    {
        //if(elemento.type === undefined)
       //     return getValorEnTextarea(elemento, objetoEditar, index);
        var name = elemento.getAttribute('name');
        var key = name.split('_')[0];
        key = key.toLowerCase();
        if(key === 'id')
            key = 'ponente_' + key;

        objetoEditar[key] = elemento.value;
        return objetoEditar;
    }

    let getValorEnTextarea = (id, objetoEditar) =>
    {
        let info = obtenerValorEnTextArea(id);
        var idGeneral = id.split('_')[0];
        
        var key = idGeneral.substring(1, idGeneral.length);
        key = key.toLowerCase();
        objetoEditar[key] = info;
        return objetoEditar;
        //objetoEditar[]
    }

    let agregarObjetoNuevo = () =>
    {
        let identificador = "ponente_" + obtenerValorEnInput('iId');        
        let nombre = obtenerValorEnInput('iNombre');        
        let apellido = obtenerValorEnInput('iApellido');        
        let silabas = obtenerValorEnInput('iSilabas');
        let biografia = obtenerValorEnTextArea('iBiografia');        
        
        let titulo = obtenerValorEnInput('iTitulo');
        let texto = obtenerValorEnTextArea('iTexto');        
        
        let ponenteObject = {
            id: identificador,
            nombre: nombre,
            apellido: apellido,
            silabas: silabas,
            biografia: biografia,
            ponencia: {
                titulo: titulo,
                texto: texto
            }
        };         

        objetosGuardar.ponentes.push(ponenteObject);
    }

    let salvarInformacion = s =>
    {
        let httpRequest = require('./request');
        httpRequest.colocarJSONData('ActualizarData', OnHttpRequestFinishes, this.jsonData);
    }    

    let OnHttpRequestFinishes = data =>
    {
        console.log(data);
        if(data.status === 1)
        {
            alert('Informacion actualizada');
            location.reload();
        }
    }

    let obtenerValorEnInput = idInput =>
    {
        var element = document.getElementById(idInput);
        
        /*if(ano == 0)
            return terminarFuncionConError('Favor de elegir un año');*/

        return element.value;
    }

    let obtenerValorEnTextArea = idTextArea => 
    {
        var element = document.getElementById(idTextArea);
        var textDocument = document.getElementById(idTextArea + "WidgIframe").contentWindow.document;
        var texto = textDocument.getElementById('iframeBody');

        
        /*if(ano == 0)
            return terminarFuncionConError('Favor de elegir un año');*/        
        //console.log({element: element});
        
        return texto.innerHTML;
    }

    let obtenerMes = () =>
    {
        var mesElement = document.getElementById('iMes');
        var mes = Number(mesElement.options[mesElement.selectedIndex].value);
        if(mes == 0)
            return terminarFuncionConError('Favor de elegir un mes');

        return mes;
    }

    let obtenerFacturasRecibidas = () =>
    {
        var modelo = {};
        modelo.facturas = [];        
        
        let group = document.getElementById('groupRecibido');    
        for(var i = 3; i < group.childNodes.length - 2; i += 2)    
            modelo.facturas.push(getFacturaDeSeccion(group.childNodes[i]));      

        return modelo;  
    }

    let obtenerFacturasGastadas = () =>
    {
        var modelo = {};
        modelo.facturas = [];        
        
        let group = document.getElementById('groupGastado');    
        
        for(var i = 3; i < group.childNodes.length - 2; i += 2)    
            modelo.facturas.push(getFacturaDeSeccion(group.childNodes[i]));      

        return modelo;  
    }

    let getFacturaDeSeccion = seccion =>
    {
        var modelo = {};
        modelo.cantidad = getInputChildValue(seccion, 1);
        modelo.iva = getInputChildValue(seccion, 3);
        modelo.ivaretenido = getInputChildValue(seccion, 5);
        modelo.isrretenido = getInputChildValue(seccion, 7);
        modelo.idfactura = getInputChildValue(seccion, 9);

        return modelo;
    }

    let getInputChildValue = (seccion, index) =>
    {
        return seccion.childNodes[index].childNodes[1].value;
    }

    let terminarFuncionConError = mensaje =>
    {
        alert(mensaje);
        return false;
    }

    return this;
});