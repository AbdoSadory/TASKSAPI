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

  search(search) {
    const queryFiler = {}
    if (search?.title)
      queryFiler.title = { $regex: search.title, $options: "i" }
    if (search?.desc) queryFiler.desc = { $regex: search.desc, $options: "i" }
    if (search?.discount) queryFiler.discount = { $ne: 0 }
    if (search?.stock) queryFiler.stock = { stock: search.stock }
    if (search?.priceFrom && !search?.priceTo)
      queryFiler.appliedPrice = { $gte: search.priceFrom }
    if (search?.priceTo && !search?.priceFrom)
      queryFiler.appliedPrice = { $lte: search.priceTo }
    if (search?.priceTo && search?.priceFrom)
      queryFiler.appliedPrice = { $gte: search.priceFrom, $lte: search.priceTo }
    if (search?.rateFrom && !search?.rateTo)
      queryFiler.rate = { $gte: search.rateFrom }
    if (search?.rateTo && !search?.rateFrom)
      queryFiler.rate = { $lte: search.rateTo }
    if (search?.rateTo && search?.rateFrom)
      queryFiler.rate = { $gte: search.rateFrom, $lte: search.rateTo }

    if (search?.specs) {
      // Change the specs form:
      // From : { colors: [ 'red', 'Black' ], size: [ 1, 2, 3 ] }
      // To : { 'specs.colors': { '$all': [ 'red', 'Black' ] }, 'specs.size': { '$all': [ 1 ] } }
      // to be able search on nested document
      const specs = JSON.parse(search?.specs)
      for (const key in specs) {
        queryFiler[`specs.${key}`] = { $all: specs[key] }
      }
    }
    if (search?.addedBy) {
      queryFiler.addedBy = search?.addedBy
    }
    if (search?.updatedBy) {
      queryFiler.updatedBy = search?.updatedBy
    }
    if (search?.categoryId) {
      queryFiler.categoryId = search?.categoryId
    }
    if (search?.subCategoryId) {
      queryFiler.subCategoryId = search?.subCategoryId
    }
    this.mongooseQuery = this.mongooseQuery.find(queryFiler)
    return this
  }

  filters(filters) {
    /**
         * the filters will contian data like this
         * @params will be in this formate
            appliedPrice[gte]=100 
            stock[lte]=200
            discount[ne]=0
            title[regex]=iphone
        */
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
