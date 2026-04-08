package repository

func (r *Repository) DeleteReconstructionOrder(orderID uint) error {
	sql := `UPDATE reconstruction_orders SET status = 'deleted' WHERE id = $1`
	return r.DB.Exec(sql, orderID).Error
}
