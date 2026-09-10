// src/components/VirtualizedCardGrid.jsx
import { memo } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import CardFitCity from './CardFitCity'

const VirtualizedCardGrid = memo(({ cards, columns = 3, rowHeight = 200 }) => {
  const rows = Math.ceil(cards.length / columns)

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columns + columnIndex
    if (index >= cards.length) return null
    
    const card = cards[index]
    return (
      <div style={style}>
        <CardFitCity
          nome={card.nome}
          raridade={card.raridade}
          quantidade={card.qtd}
          cor1={card.cor1}
          cor2={card.cor2}
          cor3={card.cor3}
          cor4={card.cor4}
          setorLabel={card.setorLabel}
        />
      </div>
    )
  }

  return (
    <Grid
      columnCount={columns}
      columnWidth={window.innerWidth / columns - 12}
      height={500}
      rowCount={rows}
      rowHeight={rowHeight}
      width={window.innerWidth - 32}
    >
      {Cell}
    </Grid>
  )
})

export default VirtualizedCardGrid