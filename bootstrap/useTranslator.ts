import Container from 'typedi'
import { Translator } from '../libraries/i18n/translator'
import path from 'path'


export default function useTranslator() {
   const translator = new Translator({  
      fallbackLanguage: 'th',  
      baseDir: path.join(__dirname, '..', 'i18n'),  
   })

   translator.load()  

   Container.set(Translator, translator) 

   return translator 
}