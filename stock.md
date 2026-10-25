# LiveStock model

Attributes

- `LooseCoreOrderedKG`: 
    - `Connected Models`:
        - Item
        - RawMaterialPO

- `LVConductorOrderedKG`:
    - `Connected Models`:
        - Item
        - RawMaterialPO

- `HVConductorOrderedKG`:
    - `Connected Models`:
        - Item
        - RawMaterialPO

- `LooseCoreStockKG`:
    - `Connected Models`:
        - RawMaterialPO
        - RejectionStock
        - DailyProductionStock
        - PerJobData
        - StockAdjustment

- `LVConductorStockKG`:
    - `Connected Models`:
        - RawMaterialPO
        - RejectionStock
        - DailyProductionReport
        - PerJobData
        - RepairingData
        - StockAdjustment

- `HVConductorStockKG`:
    - `Connected Models`:
        - RawMaterialPO
        - RejectionStock
        - DailyProductionReport
        - PerJobData
        - RepairingData
        - StockAdjustment

- `ReadyToDispatch`:
    - `Connected Models`:
        - ProductionFlor
        - Dispatch

- `RTDRepairing`:
    - `Connected Models`:
        - RepairingData
        - Dispatch

- `Defective`:
    - `Connected Models`:
        - ReturnStock
        - RepairingStock

- `Dispatch`:
    - `Connected Models`:
        - Dispatch