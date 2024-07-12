import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
    categoryID: {
      // Tasks can be organized into categories for easier management (NOT MUST so No required:true)
      type: mongoose.Schema.Types.ObjectId,
      ref: "CATEGORY",
    },
    state: {
      type: String,
      required: true,
      enum: ["shared", "private"],
      default: "shared",
    },
    text: {
      type: String,
      trim: true,
    },
    items: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
)

const TASK = mongoose.model("TASK", taskSchema)

export default TASK
