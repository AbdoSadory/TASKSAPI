import { paginationFunction } from "./pagination.js"

export class APIFeatures {
  constructor(mongooseQuery) {
    this.mongooseQuery = mongooseQuery
  }

  pagination({ page, size }) {
    const { limit, skip } = paginationFunction({ page, size })
    this.mongooseQuery = this.mongooseQuery.limit(limit).skip(skip)
    return this
  }

  sort(sortBy) {
    if (!sortBy) {
      this.mongooseQuery = this.mongooseQuery.sort({ createdAt: -1 })
      return this
    }
    const formula = sortBy
      .replace(/desc/g, -1)
      .replace(/asc/g, 1)
      .replace(/ /g, ":") // 'stock  desc' => 'stock: -1'
    const [key, value] = formula.split(":")

    this.mongooseQuery = this.mongooseQuery.sort({ [key]: +value })
    return this
  }

  filters(filters) {
    const queryFilter = JSON.parse(
      JSON.stringify(filters).replace(
        /gt|gte|lt|lte|in|nin|eq|ne|regex/g,
        (operator) => `$${operator}`
      )
    )

    /**
     * @object will be like this after the replace method
     * { appliedPrice: { $gte: 100 }, stock: { $lte: 200 }, discount: { $ne: 0 }, title: { $regex: 'iphone' }
     */
    this.mongooseQuery.find(queryFilter)
    return this
  }
}
