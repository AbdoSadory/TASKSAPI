import mongoose from "mongoose"

const validateStringOrArray = function (value) {
  return typeof value === "string" || Array.isArray(value)
}

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
      enum: ["public", "private"],
      default: "public",
    },
    body: {
      bodyType: {
        type: String,
        required: true,
        enum: ["text", "list"],
        default: "text",
      },
      bodyContent: {
        type: mongoose.Schema.Types.Mixed,
        validate: [
          validateStringOrArray,
          "body Content MUST be String or Array",
        ],
      },
    },
  },
  { timestamps: true }
)

const TASK = mongoose.model("TASK", taskSchema)

export default TASK
