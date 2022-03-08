import { useState, useEffect, useLayoutEffect, useRef} from 'react'
import axios from 'axios';
import { useNavigate } from "react-router-dom";
const baseurl = import.meta.env.REACT_APP_API_BASE_URL;

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

function Synopsis() {
    const navigate = useNavigate();
    const focusText = useRef();
    const [editable, setEditable] = useState(false);
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState("")
    const [userdata,setUserData] = useState([]);
    const [background, setBackground] = useState(null);
    const [textheight, setheight] = useState(10);
    const [width, height] = useWindowSize();
 
    useEffect(()=>{
        let textheight = focusText?.current?.scrollHeight+"px";
        setheight(textheight)
    },[data])

    useEffect(() => {        
        let vh = window.innerHeight;
        document.getElementById("loading_synposis").style.height = vh + "px";
        let register_id =  sessionStorage.register_id || null;
        let outline_id = sessionStorage.outline_id || null;
        let background = sessionStorage.background || null;
        
        let outline_data = sessionStorage.outline_data || null;
        setBackground(JSON.parse(background));
        let data = JSON.stringify({
            "user_id":register_id,
            "outline_id":outline_id
        });

            let config = {
                method: 'post',
                url: `${baseurl}/get_outline`,
                headers: { 
                    'Content-Type': 'application/json'
                },
                    data : data,
            };
            axios(config)
            .then((response) => {
                
                if(response.data.generated && response.data.outline && !response.data.error){
                    setLoading(false);
                    setUserData(response.data.chara_img_urls)
                    setData(response.data.outline);                    
                }
                else{
                    navigate("/error",
                    {
                        state: {
                            message: "ストーリーの生成に失敗しました。<br/>時間をおいてお試しください"
                    }
                });
                }
            })
            .catch((error)=>{
                navigate("/error",
                {
                    state: {
                        message: "ストーリーの生成に失敗しました。<br/>時間をおいてお試しください"
                }
            });
            })
    }, [])


    const handleTalk = () => {
        let register_id =  sessionStorage.register_id || null;
        let outline_id = sessionStorage.outline_id || null;
        sessionStorage.setItem("outline_data", JSON.stringify(data));
        let postdata = JSON.stringify({
            "user_id":register_id,
            "outline_id":outline_id
        });
        let config = {
            method: 'post',
            url: `${baseurl}/generate_story`,
            headers: { 
                'Content-Type': 'application/json'
            },
                data : postdata,
        };
        axios(config)
        .then((response) => {
            navigate(`/talk/${response.data.story_id}`,{state: {}})
        })
        .catch((error)=>{
            navigate("/error",
                {
                    state: {
                        message: "ストーリーの生成に失敗しました。<br/>時間をおいてお試しください"
                }
            });
        })
    }

    useEffect(() => {
        if(focusText.current && editable) focusText.current.focus(); 
    }, [editable]);

    const handleUpdateOutline = () =>{
        setEditable(false);
        let register_id =  sessionStorage.register_id || null;
        let outline_id = sessionStorage.outline_id || null;
        let postdata = JSON.stringify({
            "user_id":register_id,
            "outline_id":outline_id,
            "outline":data
        });
        let config = {
            method: 'post',
            url: `${baseurl}/update_outline`,
            headers: { 
                'Content-Type': 'application/json'
            },
                data : postdata,
        };
        axios(config)
        .then((response) => {
            setUserData(response.data.new_chara_img_urls)
        })
        .catch((error)=>{
            navigate("/error",
                {
                    state: {
                        message: "ストーリーの生成に失敗しました。<br/>時間をおいてお試しください"
                }
            });
        })
    }
    
    
    return(
        <div className="container" id="loading_synposis">
            <div className="container-wrap">
                <div className={`ls-top ${editable?"editing" : ""}`} >
                    <div className="ls-top-wrap" style={{backgroundImage:`url(${background?.img_url}`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition:"center"}}>
                        <div className="ls-top-body">
                            {userdata.map((item,index)=>(
                                <div key={index} className="ls-top-item" style={{backgroundImage:`url(${item})`}}>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="ls-main">
                    <div className="ls-main-title">
                        まえがき
                    </div>
                    <div className="ls-main-loading-text">
                        {loading &&
                            <div className="ls-main-loading-part">
                                <img src="/assets/image/white-loading.gif" alt=""/>
                                <span>下書き準備中</span>
                            </div>
                        }
                        {!loading &&
                            <textarea  style={{height:textheight}}  ref={focusText} className="ls-main-loading-wrap"  value={data} disabled={!editable} onChange={(event)=>{setData(event.target.value)}} onBlur={handleUpdateOutline}/>
                        }
                    </div>
                    {!editable && <a className="ls-main-edit-btn" onClick={()=>{focusText.current.focus();setEditable(true)}}><span>編集</span><img src="/assets/image/edit-icon.png" alt=""/></a>
                    }
                     {!editable && <div className="ls-main-making-btn-part"><button onClick={handleTalk}  className={loading ? "ls-main-making-btn" : "ls-main-making-btn active"} disabled={loading}>この世界線に入る</button></div>}
                </div>
            </div>
            {!editable && <button className="back-to-btn" onClick={()=>{let user_list = sessionStorage.user_list || null; navigate("/",{state: {user_list:user_list}})}}><img src="/assets/image/back-to-img.png" alt="" /></button>}
           
        </div>
    )
}

export default Synopsis;