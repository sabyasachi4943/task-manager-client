import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Textarea } from "../components/utils/Input";
import Loader from "../components/utils/Loader";
import useFetch from "../hooks/useFetch";
import MainLayout from "../layouts/MainLayout";
import validateManyFields from "../validations";
import { useForm } from "react-hook-form";

const Task = () => {
  const authState = useSelector((state) => state.authReducer);
  const navigate = useNavigate();
  const [fetchData, { loading }] = useFetch();
  const { taskId } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const mode = taskId === undefined ? "add" : "update";
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    document.title = mode === "add" ? "Add task" : "Update Task";
  }, [mode]);

  useEffect(() => {
    if (mode === "update") {
      const config = {
        url: `/tasks/${taskId}`,
        method: "get",
        headers: { Authorization: authState.token },
      };
      fetchData(config, { showSuccessToast: false }).then((data) => {
        setTask(data.task);
        setFormData({ description: data.task.description, image: data.image });
      });
    }
  }, [mode, authState, taskId, fetchData]);

  // image config
  const imageHostKey = process.env.REACT_APP_imgbb_key;

  // const handleChange = (e) => {
  //   console.log(e);

  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  // const handleImage = (e,data) => {
  //   console.log(data);
  //   // const image = data.image[0];
  //   const image = data.image[0];
  //   const formData = new FormData();
  //   formData.append("image", image);
  //   const url = `https://api.imgbb.com/1/upload?key=${imageHostKey}`;
  //   fetch(url, {
  //     method: "POST",
  //     body: formData,
  //   })
  //     .then((res) => res.json())
  //     .then((imgData) => {
  //       setFormData({
  //         ...formData,
  //         [e.target.image]: imgData.data.url,
  //       });
  //     });
  // }

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      description: task.description,
    });
  };

  const handleFormSubmit = (data) => {
    // console.log(e);
    console.log(data);
    // e.preventDefault();
    // image
    const image = data.image[0];
    const formData = new FormData();
    formData.append("image", image);
    const url = `https://api.imgbb.com/1/upload?key=${imageHostKey}`;
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((imgData) => {
        const taskData = {
          description: data.description,
          image: imgData.data.url,
        };

        if (mode === "add") {
          const config = {
            url: "/tasks",
            method: "post",
            data: taskData,
            headers: { Authorization: authState.token },
          };
          fetchData(config).then(() => {
            navigate("/");
          });
        } else {
          const config = {
            url: `/tasks/${taskId}`,
            method: "put",
            data: taskData,
            headers: { Authorization: authState.token },
          };
          fetchData(config).then(() => {
            navigate("/");
          });
        }
      });

    const errors = validateManyFields("task", formData);
    setFormErrors({});

    if (errors.length > 0) {
      setFormErrors(
        errors.reduce((total, ob) => ({ ...total, [ob.field]: ob.err }), {}),
      );
      return;
    }
    

    // if (mode === "add") {
    //   const config = {
    //     url: "/tasks",
    //     method: "post",
    //     data: taskData,
    //     headers: { Authorization: authState.token },
    //   };
    //   fetchData(config).then(() => {
    //     navigate("/");
    //   });
    // } else {
    //   const config = {
    //     url: `/tasks/${taskId}`,
    //     method: "put",
    //     data: formData,
    //     headers: { Authorization: authState.token },
    //   };
    //   fetchData(config).then(() => {
    //     navigate("/");
    //   });
    // }
  };

  const fieldError = (field) => (
    <p
      className={`mt-1 text-pink-600 text-sm ${
        formErrors[field] ? "block" : "hidden"
      }`}
    >
      <i className="mr-2 fa-solid fa-circle-exclamation"></i>
      {formErrors[field]}
    </p>
  );

  return (
    <>
      <MainLayout>
        <form
          className="m-auto my-16 max-w-[1000px] bg-white p-8 border-2 shadow-md rounded-md"
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          {loading ? (
            <Loader />
          ) : (
            <>
              <h2 className="text-center mb-4">
                {mode === "add" ? "Add New Task" : "Edit Task"}
              </h2>
              <div className="mb-4">
                <label htmlFor="description">Description</label>
                {/* <Textarea
                  type="description"
                  name="description"
                  id="description"
                  value={formData.description}
                  placeholder="Write here.."
                  onChange={handleChange}
                /> */}

                <textarea
                  type="text"
                  name="description"
                  id="description"
                  // value={formData.description}
                  // onChange={handleChange}
                  {...register("description", {
                    required: "description is Required",
                  })}
                  placeholder={formData.description}
                  className="border-2 border-sky-500"
                />

                {fieldError("description")}
              </div>

              <div className="mb-4">
                <label htmlFor="image">Image</label>
                {/* <input
                  type="file"
                  name="image"
                  id="image"
                  value={formData.image}
                  // onChange={handleImage}
                ></input> */}

                <input
                  type="file"
                  {...register("image", {
                    required: "Photo is Required",
                  })}
                  className="input input-bordered w-full max-w-xs"
                  value={formData.image}
                />

                {fieldError("description")}
              </div>

              {/* <button
                className="bg-primary text-white px-4 py-2 font-medium hover:bg-primary-dark"
                onClick={handleSubmit}
              ></button> */}
              <input
                type="submit"
                className="bg-primary text-white px-4 py-2 font-medium hover:bg-primary-dark"
                value={mode === "add" ? "Add task" : "Update Task"}
              ></input>

              <button
                className="ml-4 bg-red-500 text-white px-4 py-2 font-medium"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
              {mode === "update" && (
                <button
                  className="ml-4 bg-blue-500 text-white px-4 py-2 font-medium hover:bg-blue-600"
                  onClick={handleReset}
                >
                  Reset
                </button>
              )}
            </>
          )}
        </form>
      </MainLayout>
    </>
  );
};

export default Task;
