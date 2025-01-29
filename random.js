import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../../providers/AuthProvider";

const ManageCamps = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [selectedCamp, setSelectedCamp] = useState(null);
    const [startDate, setStartDate] = useState(new Date());

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    const { data: camps = [], isLoading, refetch } = useQuery({
        queryKey: ["manageCamps"],
        queryFn: async () => {
            const res = await axiosSecure.get(`/camps/${user.email}`);
            return res.data;
        },
    });

    const handleUpdate = async (data) => {
        const updatedCamp = {
            campName: data.campName,
            dateAndTime: startDate.toISOString(),
            location: data.location,
            healthcareProfessional: data.healthcareProfessional,
            campFees: parseFloat(data.campFees),
        };
        
        if (data.image[0]) {
            const imageFile = data.image[0];
            const imageFormData = new FormData();
            imageFormData.append("image", imageFile);

            try {
                const imgRes = await axios.post(
                    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOSTING_KEY}`,
                    imageFormData
                );
                if (imgRes.data.success) {
                    updatedCamp.image = imgRes.data.data.display_url;
                }
            } catch (error) {
                document.getElementById("update-camp-modal").close()
                Swal.fire({
                    icon: "error",
                    title: "Image upload failed",
                    text: "Please try again later.",
                });
                return;
            }
        }

        try {
            await axiosSecure.patch(`/update-camp/${selectedCamp._id}`, updatedCamp);
            reset();
            document.getElementById("update-camp-modal").close()
            refetch();
            Swal.fire({
                icon: "success",
                title: "Camp updated successfully!",
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (error) {
            document.getElementById("update-camp-modal").close()
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Failed to update camp",
                text: error.message,
            });
        }
    };

    // Handle Delete Camp
    const handleDelete = async (campId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won’t be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.delete(`/delete-camp/${campId}`);
                    refetch();
                    Swal.fire({
                        icon: "success",
                        title: "Camp deleted successfully!",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Failed to delete camp",
                        text: error.message,
                    });
                }
            }
        });
    };

    const handleEdit = (camp) => {
        setSelectedCamp(camp);
        setStartDate(new Date(camp.dateAndTime));
        setValue("campName", camp.campName);
        setValue("location", camp.location);
        setValue("healthcareProfessional", camp.healthcareProfessional);
        setValue("campFees", camp.campFees);
        document.getElementById("update-camp-modal").showModal()
    };

    if (isLoading) {
        return (
            <div className="w-full h-[40rem] flex items-center justify-center">
                <span className="loading loading-ring loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="w-[90%] mx-auto py-8 sm:py-12 md:py-14 xl:py-16">
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-2xl sm:text-3xl xl:text-4xl text-accent font-bold text-center mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
                Manage Camps
            </motion.h2>
            <div className="w-full overflow-x-auto">
                <table className="table w-full border border-base-300">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th className="min-w-[150px]">Camp Name</th>
                            <th className="min-w-[200px]">Date & Time</th>
                            <th className="min-w-[150px]">Location</th>
                            <th className="min-w-[100px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {camps.map((camp, index) => (
                            <motion.tr
                                key={camp._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td>{index + 1}</td>
                                <td>{camp.campName}</td>
                                <td>{new Date(camp.dateAndTime).toLocaleString()}</td>
                                <td>{camp.location}</td>
                                <td className="flex gap-2">
                                    <button
                                        className="btn btn-sm btn-accent text-white"
                                        onClick={() => handleEdit(camp)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-error text-white"
                                        onClick={() => handleDelete(camp._id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

                <dialog
                    id="update-camp-modal"
                    className="modal modal-bottom sm:modal-middle"
                >
                    <form
                        className="modal-box"
                        onSubmit={handleSubmit(handleUpdate)}
                    >
                        <h3 className="font-bold text-2xl text-accent text-center mb-6">
                            Edit Camp
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Camp Name */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Camp Name</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("campName", { required: true })}
                                    className="input input-bordered w-full"
                                />
                                {errors.campName && (
                                    <span className="text-red-500">Camp Name is required</span>
                                )}
                            </div>

                            {/* Date & Time */}
                            <div className="form-control flex flex-col">
                                <label className="label">
                                    <span className="label-text font-semibold">Date & Time</span>
                                </label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="input input-bordered w-full"
                                />
                            </div>

                            {/* Location */}
                            <div className="form-control sm:col-span-2">
                                <label className="label">
                                    <span className="label-text font-semibold">Location</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("location", { required: true })}
                                    className="input input-bordered w-full"
                                />
                                {errors.location && (
                                    <span className="text-red-500">Location is required</span>
                                )}
                            </div>

                            {/* Healthcare Professional */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">
                                        Healthcare Professional
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register("healthcareProfessional", { required: true })}
                                    className="input input-bordered w-full"
                                />
                                {errors.healthcareProfessional && (
                                    <span className="text-red-500">
                                        Healthcare Professional is required
                                    </span>
                                )}
                            </div>

                            {/* Camp Fees */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Camp Fees</span>
                                </label>
                                <input
                                    type="number"
                                    {...register("campFees", { required: true })}
                                    className="input input-bordered w-full"
                                />
                                {errors.campFees && (
                                    <span className="text-red-500">Camp Fees is required</span>
                                )}
                            </div>

                            {/* Image Upload */}
                            <div className="form-control sm:col-span-2">
                                <label className="label">
                                    <span className="label-text font-semibold">Image</span>
                                </label>
                                <input
                                    type="file"
                                    {...register("image")}
                                    className="file-input file-input-bordered w-full"
                                />
                            </div>
                        </div>
                        <div className="modal-action flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => document.getElementById("update-camp-modal").close()}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-accent text-white">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </dialog>
        </div>
    );
};

export default ManageCamps;
