import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, AfterViewInit {


  ngAfterViewInit() {
    function postMessageToParent (message, targetOrigin) {
      targetOrigin = targetOrigin || '*';
      window.parent.postMessage(message, targetOrigin);
    }
    function responder(event) {
      if (event.origin !== 'http://cobasopenfinance.es') { return; }
      var message = { type: undefined, key: undefined, value: undefined };
      console.log('Incoming message: ', event.data);
      if (event.data.type === 'request') {
        // REQUEST
        message.type = 'response';
        message.key = event.data.key;
        switch (event.data.key) {
          case 'bgcolor':
            message.value = 'white';
            break;
          case 'fgcolor':
            message.value = 'black';
            break;
          default:
            console.log('Undefined request key: ',  event.data.key);
        }
        if (message.value) {
          console.log('Outgoing message: ', message);
          event.source.postMessage(message, event.origin);
        }
      } else {
        // RESPONSE OR NOTICE
        switch (event.data.key) {
          case 'key_1':
            // Utilizar respuesta
            console.log('key_1: ', event.data.value);
            break;
          case 'key_2':
            // Utilizar respuesta
            console.error('key_2: ', event.data.value);
            break;
          case 'increment':
            message.type = 'notice';
            message.key = 'increment';
            message.value = event.data.value + 1;
            event.source.postMessage(message, event.origin);
            break;
          default:
            console.log('Undefined key of response or notice: ', event.data.key);
        }
      }
    }

    // Create listener
    var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
    var eventer = window[eventMethod];
    var messageEvent = (eventMethod === 'attachEvent') ? 'onmessage' : 'message';

    eventer(messageEvent, responder, false);

    window['checkHeight'] = 0;
    function iframeResize() {
      if (window['checkHeight'] !== document.body.clientHeight) {
        window['checkHeight'] = document.body.clientHeight;
        postMessageToParent({type: 'notice', key: 'resize', value: window['checkHeight']}, 'http://cobasopenfinance.es');
      }
    }
    $( window ).resize(iframeResize);
    setInterval(iframeResize, 250);

    // Example
    /*setTimeout(function() {
      postMessageToParent({type: 'notice', key: 'completed_form', value: 1}, 'http://cobasopenfinance.es');
    }, 15000);*/
  }

  constructor() { }

  ngOnInit() {
  }

  postMsgToParent (message, targetOrigin) {
    targetOrigin = targetOrigin || '*';
    window.parent.postMessage(message, targetOrigin);
  }

}
