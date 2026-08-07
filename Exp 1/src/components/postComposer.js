import { useEffect, useState } from "react";
import PlatformSelector from "./PlatformSelector";
import CharacterCounter from "./CharacterCounter";
import ValidationMessage from "./ValidationMessage";
import Preview from "./Preview";


function PostComposer() {


  const limits = {

    Facebook: 63206,
    Instagram: 2200,
    Twitter: 280,
    LinkedIn: 3000

  };


  const hashtags = [

    "#React",
    "#JavaScript",
    "#Frontend",
    "#Coding",
    "#WebDevelopment"

  ];


  const emojis = [

    "😀",
    "🔥",
    "❤️",
    "👍",
    "🚀",
    "😂"

  ];


  const [platform,setPlatform] = useState("Facebook");

  const [post,setPost] = useState("");

  const [image,setImage] = useState("");

  const [message,setMessage] = useState("");

  const [error,setError] = useState(false);



  const limit = limits[platform];



  // Load Draft

  useEffect(()=>{

    const savedPost = localStorage.getItem("draft");

    if(savedPost){

      setPost(savedPost);

    }

  },[]);





  const handleChange=(e)=>{


    const value=e.target.value;


    setPost(value);


    localStorage.setItem(
      "draft",
      value
    );



    if(value.length > limit){


      setMessage(
        `Character limit exceeded by ${
          value.length-limit
        } characters`
      );


      setError(true);


    }


    else if(value.length > limit*0.9){


      setMessage(
        "Warning: Near character limit"
      );


      setError(false);


    }


    else{


      setMessage(
        "Post looks good!"
      );


      setError(false);


    }


  };




  const uploadImage=(e)=>{


    const file=e.target.files[0];


    if(file){

      setImage(
        URL.createObjectURL(file)
      );

    }

  };





  const addEmoji=(emoji)=>{


    setPost(post+emoji);


  };





  const addHashtag=(tag)=>{


    setPost(
      post+" "+tag
    );


  };





  const publishPost=()=>{


    if(post.trim()===""){


      setMessage(
        "Post cannot be empty"
      );


      setError(true);

      return;

    }



    if(post.length > limit){


      setMessage(
        "Reduce characters before publishing"
      );


      setError(true);

      return;

    }



    alert(
      "Post Published Successfully!"
    );


    setPost("");

    setImage("");

    setMessage("");

    setError(false);


    localStorage.removeItem(
      "draft"
    );


  };






return(

<div className="container">


<div className="card">


<h2>
Create Post
</h2>



<PlatformSelector

selectedPlatform={platform}

setSelectedPlatform={setPlatform}

/>





<div className="section">


<label>
Upload Image
</label>


<input

type="file"

accept="image/*"

onChange={uploadImage}

/>


</div>





<textarea


placeholder="Write your post..."

value={post}

onChange={handleChange}


/>





<CharacterCounter

count={post.length}

limit={limit}

/>





<div className="remaining">

Remaining Characters:

{
limit-post.length
}

</div>






<div className="progress">


<div

className="fill"

style={{

width:
`${Math.min(
(post.length/limit)*100,
100
)}%`

}}

/>


</div>





<div className="emojiBox">


<h4>
Add Emoji
</h4>


{
emojis.map((emoji)=>(


<button

className="emoji"

key={emoji}

onClick={()=>addEmoji(emoji)}

>

{emoji}

</button>


))

}



</div>





<div className="hashtagBox">


<h4>
Add Hashtag
</h4>



{

hashtags.map((tag)=>(


<button

className="tag"

key={tag}

onClick={()=>addHashtag(tag)}

>

{tag}

</button>


))

}



</div>





<ValidationMessage

message={message}

error={error}

/>






<button

onClick={publishPost}

>

Publish Post

</button>




</div>





<Preview

platform={platform}

post={post}

image={image}

/>



</div>


);


}


export default PostComposer;