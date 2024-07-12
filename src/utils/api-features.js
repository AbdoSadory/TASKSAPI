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
      .replace(/ /g, ":")
    const [key, value] = formula.split(":")

    this.mongooseQuery = this.mongooseQuery.sort({ [key]: +value })
    return this
  }
}
