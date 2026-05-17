import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";

import toast, {
  Toaster
} from "react-hot-toast";

import imageCompression from "browser-image-compression";

import "./App.css";

import loginImage from "./assests/login.png";

const API_URL =
  "https://bubu-server.onrender.com";


function App() {

  const [isLogin, setIsLogin] =
    useState(true);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [token, setToken] =
    useState("");

  const [filesToUpload, setFilesToUpload] =
    useState([]);

  const [files, setFiles] =
    useState([]);

  const [activeFolder, setActiveFolder] =
    useState("photos");

  const [selectedFiles, setSelectedFiles] =
    useState([]);

  const [multiDeleteMode, setMultiDeleteMode] =
    useState(false);

  const [currentAudio, setCurrentAudio] =
    useState(null);

  const [currentVideo, setCurrentVideo] =
    useState(null);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [dragActive, setDragActive] =
    useState(false);

  const [folders, setFolders] =
  useState([]);

  const [currentFolder, setCurrentFolder] =
    useState("");

  const [newFolderName, setNewFolderName] =
    useState("");

  const [showFolderPopup, setShowFolderPopup] =
    useState(false);

    const [showRenamePopup, setShowRenamePopup] =
  useState(false);

const [renameFolderText, setRenameFolderText] =
  useState("");

  const [search, setSearch] =
  useState("");

const [showMovePopup, setShowMovePopup] =
  useState(false);

const [moveFolder, setMoveFolder] =
  useState("General");

const [loading, setLoading] =
  useState(false);

  // =========================
  // REGISTER
  // =========================

  const register = async () => {

    try {

      const res = await axios.post(
        `${API_URL}/register`,
        {
          email,
          password,
        }
      );

      toast.success(
        res.data.message
      );

      setIsLogin(true);

    }

    catch (error) {

      toast.error(
        "Registration Failed"
      );

    }

  };



  // =========================
  // LOGIN
  // =========================

  const login = async () => {

    try {

      const res = await axios.post(
        `${API_URL}/login`,
        {
          email,
          password,
        }
      );

      if (res.data.token) {

        setToken(res.data.token);

        toast.success(
          "Login Successful"
        );

      }

      else {

        toast.error(
          res.data.message
        );

      }

    }

    catch (error) {

      toast.error(
        "Login Failed"
      );

    }

  };



  // =========================
  // LOGOUT
  // =========================

  const logout = () => {

    setToken("");

    setFiles([]);

    setSelectedFiles([]);

    localStorage.removeItem("token");

  };



  // =========================
  // FETCH FILES
  // =========================
const fetchFiles = async () => {

  try {


    const res = await axios.get(

      `${API_URL}/files`,

      {
        headers: {
          authorization: token,
        },

        timeout: 10000,
      }

    );



    setFiles(res.data);

  }

  catch (error) {

    console.log(error);

    toast.error(
      "Failed To Load Files"
    );

  }

  finally {

    setLoading(false);

  }

};
  // =========================
  // UPLOAD FILE
  // =========================

  const uploadFile = async () => {

    if (
      filesToUpload.length === 0
    ) {

      toast.error(
        "Please Select Files"
      );

      return;

    }

    try {

      setLoading(true);
for (
  let i = 0;
  i < filesToUpload.length;
  i++
) {

  let uploadFileData =
    filesToUpload[i];



  if (

    filesToUpload[
      i
    ].type.startsWith(
      "image"
    )

  ) {

    uploadFileData =
      await imageCompression(

        filesToUpload[i],

        {

          maxSizeMB: 1,

          maxWidthOrHeight:
            1920,

          useWebWorker:
            true,

        }

      );

  }



  const formData =
    new FormData();



  formData.append(
    "file",
    uploadFileData

  );       
  
  formData.append(
          "folder",
          currentFolder
        );

      await axios.post(

  `${API_URL}/upload`,

  formData,

  {

    headers: {

      authorization:
        token,

      "Content-Type":
        "multipart/form-data",

    },



    timeout:
      600000,



    maxBodyLength:
      Infinity,



    maxContentLength:
      Infinity,

  }

);

      }

      toast.success(
        "Files Uploaded Successfully"
      );

      setFilesToUpload([]);

   

setFilesToUpload([]);

fetchFiles();

      setLoading(false);

    }

    catch (error) {

      toast.error(
        "Upload Failed"
      );

      setLoading(false);

    }

  };



  // =========================
  // TOGGLE SELECT FILE
  // =========================

  const toggleSelectFile = (id) => {

    if (
      selectedFiles.includes(id)
    ) {

      setSelectedFiles(
        selectedFiles.filter(
          (item) => item !== id
        )
      );

    }

    else {

      setSelectedFiles([
        ...selectedFiles,
        id,
      ]);

    }

  };



  // =========================
  // DELETE SELECTED FILES
  // =========================

  const deleteSelectedFiles =
  async () => {

    try {

      const deletePromises =

        selectedFiles.map(
          (id) =>

            axios.delete(

              `${API_URL}/delete/${id}`,

              {

                headers: {

                  authorization:
                    token,

                },

              }

            )

        );



      await Promise.all(
        deletePromises
      );



      toast.success(
        "Selected Files Deleted"
      );



      setSelectedFiles([]);



      setMultiDeleteMode(false);



      fetchFiles();

    }

    catch (error) {

      console.log(error);



      toast.error(
        "Delete Failed"
      );

    }

  };

  // =========================
  // CREATE FOLDER
  // =========================

  const createFolder = () => {

    if (!newFolderName.trim()) {

      toast.error(
        "Enter Folder Name"
      );

      return;

    }

    if (
      folders.includes(
        newFolderName
      )
    ) {

      toast.error(
        "Folder Already Exists"
      );

      return;

    }

    setFolders([
      ...folders,
      newFolderName,
    ]);

    setCurrentFolder(
      newFolderName
    );

    setNewFolderName("");

    setShowFolderPopup(false);

    toast.success(
      "Folder Created"
    );

  };

  



  // =========================
  // DELETE FOLDER
  // =========================

 const deleteFolder = async () => {

  if (
    currentFolder === "General"
  ) {

    toast.error(
      "General Folder Cannot Be Deleted"
    );

    return;

  }

  try {

    await axios.put(

      `${API_URL}/move-folder`,

      {
        oldFolder:
          currentFolder,

        newFolder:
          "General",
      }

    );



    fetchFiles();

    setCurrentFolder(
      "General"
    );



    toast.success(
      "Folder Deleted"
    );

  }

  catch (error) {

    toast.error(
      "Delete Failed"
    );

  }

};
  // =========================
// RENAME FOLDER
// =========================

const renameFolder = () => {

  if (
    currentFolder === "General"
  ) {

    toast.error(
      "General Folder Cannot Be Renamed"
    );

    return;

  }



  if (
    !renameFolderText.trim()
  ) {

    toast.error(
      "Enter Folder Name"
    );

    return;

  }



  if (
    folders.includes(
      renameFolderText
    )
  ) {

    toast.error(
      "Folder Already Exists"
    );

    return;

  }



  const updatedFolders =
    folders.map((folder) => {

      if (
        folder === currentFolder
      ) {

        return renameFolderText;

      }

      return folder;

    });



  const updatedFiles =
    files.map((file) => {

      if (
        file.folder === currentFolder
      ) {

        return {

          ...file,

          folder:
            renameFolderText,

        };

      }

      return file;

    });



  setFolders(updatedFolders);

  setFiles(updatedFiles);

  setCurrentFolder(
    renameFolderText
  );

  setRenameFolderText("");

  setShowRenamePopup(false);

  toast.success(
    "Folder Renamed"
  );

};


  // =========================
// MOVE FILES
// =========================

const moveFilesToFolder =
  async () => {

    try {

      const updatedFiles =
        files.map((file) => {

          if (

            selectedFiles.includes(
              file._id
            )

          ) {

            return {

              ...file,

              folder:
                moveFolder,

            };

          }

          return file;

        });



      setFiles(updatedFiles);

      setSelectedFiles([]);

      setShowMovePopup(false);

      toast.success(
        "Files Moved Successfully"
      );

    }

    catch (error) {

      toast.error(
        "Move Failed"
      );

    }

  };

  // =========================
// FAVORITE FILE
// =========================

const toggleFavorite =
  (id) => {

    const updatedFiles =
      files.map((file) => {

        if (
          file._id === id
        ) {

          return {

            ...file,

            favorite:
              !file.favorite,

          };

        }

        return file;

      });



    setFiles(updatedFiles);

};

  // =========================
  // FETCH FILES ON LOGIN
  // =========================

  useEffect(() => {

    if (token) {

      fetchFiles();

    }

  }, [token]);
// =========================
// AUTO GENERATE FOLDERS
// =========================

useEffect(() => {

 const uniqueFolders = [

  ...new Set(

    [
      "General",

      ...files.map(
        (file) => file.folder
      ),
    ]

  ),

];
  setFolders(uniqueFolders);

}, [files]);


  // =========================
  // GLOBAL DRAG & DROP
  // =========================

  useEffect(() => {

    const handleWindowDragOver =
      (e) => {

        e.preventDefault();

        setDragActive(true);

      };



    const handleWindowDrop =
      (e) => {

        e.preventDefault();

        setDragActive(false);

        const droppedFiles =
          Array.from(
            e.dataTransfer.files
          );

        setFilesToUpload(
          droppedFiles
        );

      };



    const handleWindowDragLeave =
      (e) => {

        if (
          e.clientX === 0 &&
          e.clientY === 0
        ) {

          setDragActive(false);

        }

      };



    window.addEventListener(
      "dragover",
      handleWindowDragOver
    );

    window.addEventListener(
      "drop",
      handleWindowDrop
    );

    window.addEventListener(
      "dragleave",
      handleWindowDragLeave
    );



    return () => {

      window.removeEventListener(
        "dragover",
        handleWindowDragOver
      );

      window.removeEventListener(
        "drop",
        handleWindowDrop
      );

      window.removeEventListener(
        "dragleave",
        handleWindowDragLeave
      );

    };

  }, []);




 // =========================
// FILTER FILES
// =========================

const filteredFiles =
  files.filter((item) => {

    const matchesFolder =
      item.folder === currentFolder;



    const matchesSearch =

      item.filename
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );



    if (
      activeFolder ===
      "favorites"
    ) {

      return (

        item.favorite &&

        matchesFolder &&

        matchesSearch

      );

    }



    if (
      activeFolder ===
      "photos"
    ) {

      return (

        item.filetype.startsWith(
          "image"
        ) &&

        matchesFolder &&

        matchesSearch

      );

    }



    if (
      activeFolder ===
      "videos"
    ) {

      return (

        item.filetype.startsWith(
          "video"
        ) &&

        matchesFolder &&

        matchesSearch

      );

    }



    if (
      activeFolder ===
      "audios"
    ) {

      return (

        item.filetype.startsWith(
          "audio"
        ) &&

        matchesFolder &&

        matchesSearch

      );

    }



    return false;

  });




  


  // =========================
  // LOGIN SCREEN
  // =========================
if (!token) {

    return (

      <div className="auth-container">

        <Toaster position="top-right" />



        <div className="auth-image-section">

          <img
            src={loginImage}
            alt=""
            className="auth-image"

            onError={(e) => {

  e.target.src =
    "https://placehold.co/300x300";

}}
          />




          

        </div>

        


  



        <div className="auth-card">

          <h1>Bubu-Dudu App</h1>

          <p>
            Secure Personal Media Storage
          </p>


          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />


          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />


          {
            isLogin ? (

              <button onClick={login}>
                Login
              </button>

            ) : (

              <button onClick={register}>
                Register
              </button>

            )
          }


          <div className="switch-auth">

            {
              isLogin ? (

                <p>

                  Don't have account?

                  <span
                    onClick={() =>
                      setIsLogin(false)
                    }
                  >
                    Register
                  </span>

                </p>

              ) : (

                <p>

                  Already have account?

                  <span
                    onClick={() =>
                      setIsLogin(true)
                    }
                  >
                    Login
                  </span>

                </p>

              )
            }

          </div>

        </div>

      </div>

    );

  }



  // =========================
  // MAIN APP
  // =========================

  return (

    <div className="container">

      <Toaster position="top-right" />



      {/* DRAG OVERLAY */}

      {
        dragActive && (

          <div className="drag-overlay">

            <div className="drag-box">

              <h1>📂</h1>

              <h2>
                Drop Files Here
              </h2>

              <p>
                Upload Images, Videos & Voice Notes
              </p>

            </div>

          </div>

        )
      }



      {/* TOP BAR */}

      <div className="top-bar">

        <h1>Bubu-Dudu App</h1>

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </div>



    {/* FOLDERS */}

<div className="folder-container">

  <div
    className="folder"
    onClick={() =>
      setActiveFolder("photos")
    }
  >

    <div className="folder-icon">
      📸
    </div>

    <p>Photos</p>

  </div>



  <div
    className="folder"
    onClick={() =>
      setActiveFolder("videos")
    }
  >

    <div className="folder-icon">
      🎥
    </div>

    <p>Videos</p>

  </div>



  <div
    className="folder"
    onClick={() =>
      setActiveFolder("audios")
    }
  >

    <div className="folder-icon">
      🎤
    </div>

    <p>Voice Notes</p>

  </div>



  <div
    className="folder"
    onClick={() =>
      setActiveFolder("favorites")
    }
  >

    <div className="folder-icon">
      ❤️
    </div>

    <p>Favorites</p>

  </div>

</div>


      {/* HEADER */}

      <div className="folder-header">

        <h2>
          {activeFolder}
        </h2>

      </div>

      <div className="search-container">

  <input
    type="text"
    placeholder="Search media..."
    value={search}
    onChange={(e) =>
      setSearch(
        e.target.value
      )
    }
    className="search-input"
  />

</div>



      {/* FOLDER SYSTEM */}

      <div className="folder-system">

        <div className="folder-list">

          {
            folders.map((folder) => (

              <button
                key={folder}
                className={
                  currentFolder === folder
                    ? "active-folder-btn"
                    : "folder-btn"
                }
                onClick={() =>
                  setCurrentFolder(folder)
                }
              >
                📁 {folder}
              </button>

            ))
          }

        </div>



        <div className="folder-actions">

          <button
            className="create-folder-btn"
            onClick={() =>
              setShowFolderPopup(true)
            }
          >
            + New Folder
          </button>

<button
  className="rename-folder-btn"
  onClick={() =>
    setShowRenamePopup(true)
  }
>
  ✏️ Rename Folder
</button>

          <button
            className="delete-folder-btn"
            onClick={deleteFolder}
          >
            🗑 Delete Folder
          </button>

        </div>

      </div>



      {/* MULTI DELETE BAR */}

      {
        selectedFiles.length > 0 && (

          <div className="multi-delete-bar">

            <p>
              {selectedFiles.length}
              {" "}
              Selected
            </p>

            <button
              onClick={deleteSelectedFiles}
            >
              Delete Selected
            </button>

          </div>

        )
      }



      {/* FULLSCREEN IMAGE */}

      {
        selectedImage && (

          <div
            className="fullscreen-viewer"
            onClick={() =>
              setSelectedImage(null)
            }
          >

            <button
              className="close-viewer"
            >
              ✕
            </button>

            <img
              src={selectedImage}
              alt=""
              className="fullscreen-image"
            />

          </div>

        )
      }



      {/* CREATE FOLDER POPUP */}

      {
        showFolderPopup && (

          <div className="upload-modal">

            <div className="upload-modal-content">

              <h2>
                Create Folder
              </h2>


              <input
                type="text"
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) =>
                  setNewFolderName(
                    e.target.value
                  )
                }
                className="folder-input"
              />


              <div className="modal-buttons">

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setShowFolderPopup(false)
                  }
                >
                  Cancel
                </button>


                <button
                  className="confirm-upload-btn"
                  onClick={createFolder}
                >
                  Create
                </button>

              </div>

            </div>

          </div>

        )
      }
{
  showRenamePopup && (

    <div className="upload-modal">

      <div className="upload-modal-content">

        <h2>
          Rename Folder
        </h2>


        <input
          type="text"
          placeholder="New Folder Name"
          value={renameFolderText}
          onChange={(e) =>
            setRenameFolderText(
              e.target.value
            )
          }
          className="folder-input"
        />


        <div className="modal-buttons">

          <button
            className="cancel-btn"
            onClick={() =>
              setShowRenamePopup(false)
            }
          >
            Cancel
          </button>


          <button
            className="confirm-upload-btn"
            onClick={renameFolder}
          >
            Rename
          </button>

        </div>

      </div>

    </div>

  )
}


      {/* FLOATING UPLOAD BUTTON */}

      <label className="modern-upload-btn">

        +

        <input
          type="file"
          multiple
          hidden
          onChange={(e) => {

            setFilesToUpload(
              Array.from(
                e.target.files
              )
            );

          }}
        />

      </label>



      {/* UPLOAD MODAL */}

      {
        filesToUpload.length > 0 && (

          <div className="upload-modal">

            <div className="upload-modal-content">

              <h2>
                Upload Preview
              </h2>

              <div className="multi-preview-grid">

                {
                  filesToUpload.map(
                    (file, index) => (

                      <div
                        className="preview-card"
                        key={index}
                      >

                        {
                          file.type.startsWith(
                            "image"
                          ) && (

                           <div className="image-preview-placeholder">

  📸 Image Selected

</div>

                          )
                        }


                        {
                          file.type.startsWith(
                            "video"
                          ) && (

                            <div className="video-preview-placeholder">

  🎥 Video Selected

</div>


                          )
                        }


                        {
                          file.type.startsWith(
                            "audio"
                          ) && (

                            <div className="audio-preview">
                              🎤
                            </div>

                          )
                        }


                        <p className="preview-name">

                          {file.name}

                        </p>

                      </div>

                    )
                  )
                }

              </div>



              <div className="modal-buttons">

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setFilesToUpload([])
                  }
                >
                  Cancel
                </button>


                <button
  className="confirm-upload-btn"
  onClick={uploadFile}
  disabled={loading}
>

  {
    loading
      ? "Uploading..."
      : "Upload"
  }

</button>

              </div>

            </div>

          </div>

        )
      }



      {/* MEDIA GRID */}

      <div className="media-grid">

  {

    filteredFiles.length === 0 && (

      <div className="empty-state">

        No memories yet 💙

      </div>

    )

  }

  {

    filteredFiles.map((item) => (

            <div
              className={`card ${
                selectedFiles.includes(item._id)
                  ? "selected-card"
                  : ""
              }`}
              key={item._id}
            >


              {/* IMAGES */}

              {
                item.filetype.startsWith(
                  "image"
                ) && (

                  <>
                  <button
  className="favorite-btn"
  onClick={() =>
    toggleFavorite(item._id)
  }
>

  {
    item.favorite
      ? "❤️"
      : "🤍"
  }

</button>

                    <button
                      className="delete-btn"
                      onClick={(e) => {

                        e.stopPropagation();

                        setMultiDeleteMode(true);

                        toggleSelectFile(
                          item._id
                        );

                      }}
                    >
                      🗑
                    </button>


                    <p className="file-name">

                      {item.filename}

                    </p>


                    <div className="image-wrapper">

                      <img  loading="lazy"
                     src={item.filepath.replace(
  "/upload/",
  "/upload/q_auto,f_auto/"
)}
                        alt=""
                        onClick={() =>
                          setSelectedImage(
  item.filepath
)
                        }
                      />

                    </div>

                  </>

                )
              }



              {/* VIDEOS */}

              {
                item.filetype.startsWith(
                  "video"
                ) && (

                  <>
<button
  className="favorite-btn"
  onClick={() =>
    toggleFavorite(item._id)
  }
>

  {
    item.favorite
      ? "❤️"
      : "🤍"
  }

</button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {

                        e.stopPropagation();

                        setMultiDeleteMode(true);

                        toggleSelectFile(
                          item._id
                        );

                      }}
                    >
                      🗑
                    </button>


                    <p className="file-name">

                      {item.filename}

                    </p>


                    <div className="video-wrapper">

               <video
  controls
  preload="metadata"
  className="video-player"
>

  <source
src={item.filepath.replace(
  "/upload/",
  "/upload/q_auto,f_auto/"
)}    type={item.filetype}
  />

</video>

                    </div>

                  </>

                )
              }



              {/* AUDIOS */}

              {
                item.filetype.startsWith(
                  "audio"
                ) && (

                  <div className="chat-audio-container">

                    <div className="chat-audio-bubble">


                      <div className="audio-top">

                        <span className="audio-name">
                          🎤 Voice Note
                        </span>

<button
  className="favorite-btn"
  onClick={() =>
    toggleFavorite(item._id)
  }
>

  {
    item.favorite
      ? "❤️"
      : "🤍"
  }

</button>
                        <button
                          className="audio-delete-btn"
                          onClick={(e) => {

                            e.stopPropagation();

                            setMultiDeleteMode(true);

                            toggleSelectFile(
                              item._id
                            );

                          }}
                        >
                          🗑
                        </button>

                      </div>



                      <audio
                        controls
                        onPlay={(e) => {

                          if (
                            currentAudio &&
                            currentAudio !==
                            e.target
                          ) {

                            currentAudio.pause();

                          }

                          setCurrentAudio(
                            e.target
                          );

                        }}
                      >

                        <source
                          src={item.filepath}
                        />

                      </audio>



                      <p className="audio-time">

                        {item.filename}

                      </p>

                    </div>

                  </div>

                )
              }

            </div>

          ))
        }

      </div>

    </div>

  );

}





export default App;
