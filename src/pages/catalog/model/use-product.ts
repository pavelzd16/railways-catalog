import { useState, useMemo } from 'react'
import { usePageData } from '@/shared/seo/page-context'

export function useProduct(slug: string | undefined) {
  const data = usePageData()
  const product = data.product?.slug === slug ? data.product : null
  const loading = data.status === 0
  const error = data.status === 404 ? 'Товар не найден' : data.status >= 500 ? 'Не удалось загрузить товар. Повторите попытку позже.' : null
  const [selection, setSelection] = useState({ slug, index: 0 })
  const selectedImage = selection.slug === slug ? selection.index : 0
  const setSelectedImage = (index: number) => setSelection({ slug, index })
  const [railLength, setRailLength] = useState('12.5')

  const weightSpec = product?.specs?.find((s) => s.id === 'weight')
  const lengthSpec = product?.specs?.find((s) => s.id === 'length')

  const weightPerMeter =
    typeof weightSpec?.value === 'number' ? weightSpec.value : 0

  const defaultRailLength =
    typeof lengthSpec?.value === 'number' ? lengthSpec.value : 12.5

  const totalWeight = useMemo(
    () => weightPerMeter * Number(railLength || 0),
    [weightPerMeter, railLength],
  )

  const tons = totalWeight / 1000

  const displaySpecs = useMemo(
    () =>
      product?.specs?.filter(
        (spec) => spec.id !== 'weight' || spec.unit !== 'кг/м',
      ) ?? [],
    [product?.specs],
  )

  const selectedProductImage =
    product?.images[selectedImage] ||
    product?.images[0] ||
    ''

  const similarProducts = product?.similarProducts ?? []
  const isRail = product?.categorySlug === 'rails'

  return {
    product,
    loading,
    error,
    selectedImage,
    setSelectedImage,
    railLength,
    setRailLength,
    weightPerMeter,
    defaultRailLength,
    totalWeight,
    tons,
    displaySpecs,
    selectedProductImage,
    similarProducts,
    isRail,
  }
}
