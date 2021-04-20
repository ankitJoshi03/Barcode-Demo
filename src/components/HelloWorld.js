import DBR from "../dbr";
import React from 'react';
import BarcodeScanner from './BarcodeScanner';
import './HelloWorld.css';

class HelloWorld extends React.Component {
    constructor(props){
        super(props);
        this.reader = null;
        this.refDivMessage = React.createRef();
        this.state = {
            messageKeyBase: 0,
            messages: [],
            bShowScanner: false
        };
    }
    componentDidUpdate(){
        this.refDivMessage.current.scrollTop = this.refDivMessage.current.scrollHeight;
    }
    componentWillUnmount(){
        if(this.reader){
            this.reader.destroy();
        }
    }
    render() {
        return (
            <div className="center">
                <h1>{ this.props.title }</h1>
                <div className="container">
                { !this.state.bShowScanner ? (
                        <div>
                        Choose image(s) to decode:
                        <br></br>
                        <br></br>
                        <input className="inputfile" name="file" id="file" onChange={this.onIptChange} type="file" multiple accept="image/png,image/jpeg,image/bmp,image/gif" />
                        <label for="file">Choose a file</label>
                        <br/><br/>
                        <button className="show-btn" onClick={this.showScanner}>Open Scanner</button>
                        <br></br>
                        </div>
                ) : (
                    <div>
                        <button className="show-btn" onClick={this.hideScanner}>Hide Scanner</button>
                        <BarcodeScanner appendMessage={this.appendMessage}></BarcodeScanner>
                    </div>
                ) }
            
                <div style={style.div_message} ref={this.refDivMessage}>
                    { this.state.messages.map((message, index) => 
                        <p className="redfont" key={ this.state.messageKeyBase + index }>
                            { message }
                        </p>
                    ) }
                </div>
                </div>
            </div>
        );
    }
    appendMessage = str => {
        this.setState(state=>{
            state.messages.push(str);
            if(state.messages.length > 500){
                ++state.messageKeyBase;
                state.messages.splice(0, 1);
            }
            return state;
        });
    }
    clearMessage=str =>{
        this.setState(state=>{
            state.messages=[];
        });
    }
    onIptChange = event=>{
        // React can't get event.target in async func by default.
        // Thus get event.target in sync part.
        let input = event.target;

        (async ()=>{
            try{
                this.clearMessage();
                this.appendMessage("Reading...");
                let reader = this.reader = this.reader || await DBR.BarcodeReader.createInstance();
                let settings = await reader.getRuntimeSettings();
                settings.furtherModes.dpmCodeReadingModes = [
                    DBR.EnumDPMCodeReadingMode.DPMCRM_GENERAL, 0, 0, 0, 0, 0, 0, 0];
                settings.furtherModes.grayscaleTransformationModes = [
                    DBR.EnumGrayscaleTransformationMode.GTM_INVERTED,DBR.EnumGrayscaleTransformationMode.GTM_ORIGINAL,0,0,0,0,0,0];
                settings.furtherModes.imagePreprocessingModes = [
                    DBR.EnumImagePreprocessingMode.IPM_SHARPEN_SMOOTH, 0, 0, 0, 0, 0, 0, 0];
                settings.furtherModes.textureDetectionModes = [
                    DBR.EnumTextureDetectionMode.TDM_GENERAL_WIDTH_CONCENTRATION, 0, 0, 0, 0, 0, 0, 0];
                settings.scaleDownThreshold = 99999;
        
                settings.timeout = 99999;
    
                settings.localizationModes = [      
                DBR.EnumLocalizationMode.LM_CONNECTED_BLOCKS, 0, 0, 0, 0, 0, 0, 0];
                settings.deblurLevel = 9;
                
        
                await reader.updateRuntimeSettings(settings);
                let files = input.files;
                for(let i = 0; i < files.length; ++i){
                let file = files[i];
                this.appendMessage(file.name + ':')
                let results = await reader.decode(file);
                console.log(results)
                this.clearMessage();
                this.appendMessage("Output:");
                for(let result of results){
                    let bartext=result.barcodeText
                    let finalbar=bartext.slice(-13);
                    this.appendMessage(finalbar);
                }
                }
                input.value = "";
                // this.appendMessage("======== finish read ========");
            }catch(ex){
                this.appendMessage(ex.message);
                console.error(ex);
            }
        })();
    }
    showScanner = ()=>{
        this.setState({
            bShowScanner: true
        });
    }
    hideScanner = ()=>{
        this.setState({
            bShowScanner: false
        });
    }
}

const style = {
    div_message: {
        maxHeight: "200px",
        overflowY: "auto",
        resize: "both"
    }
}

export default HelloWorld;
