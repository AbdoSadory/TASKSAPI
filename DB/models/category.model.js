import mongoose from "mongoose"

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

categorySchema.virtual("category_tasks", {
  ref: "TASK",
  foreignField: "categoryID",
  localField: "_id",
})

const CATEGORY = mongoose.model("CATEGORY", categorySchema)

export default CATEGORY
