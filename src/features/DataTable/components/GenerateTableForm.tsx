import { MAX_COLUMNS, MAX_ROWS } from "../config";
import { useTableContext } from "../hooks/useTableContext";

const GenerateTableForm = () => {
  const { onGenerate, rows, columns, closest } = useTableContext();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    onGenerate({
      rows,
      columns,
      closest,
      [name]: Number(value),
    });
  };
  return (
    <form
      style={{
        display: "flex",
        gap: "1rem",
        marginBottom: "1rem",
        justifyContent: "flex-start",
      }}
    >
      <fieldset>
        <legend>M (rows):</legend>
        <label htmlFor="rows">
          <input
            onChange={onChange}
            value={rows}
            id="rows"
            name="rows"
            min={0}
            max={MAX_ROWS}
            type="number"
            placeholder="Rows"
            style={{ border: "none", width: "100%", textAlign: "center" }}
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>N (columns):</legend>
        <label htmlFor="columns">
          <input
            onChange={onChange}
            value={columns}
            id="columns"
            name="columns"
            min={0}
            max={MAX_COLUMNS}
            type="number"
            placeholder="Columns"
            style={{ border: "none", width: "100%", textAlign: "center" }}
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>Closest X values:</legend>
        <label htmlFor="closest">
          <input
            onChange={onChange}
            value={closest}
            id="closest"
            name="closest"
            min={0}
            max={(rows * columns) / 2}
            type="number"
            placeholder="Closest X values"
            style={{ border: "none", width: "100%", textAlign: "center" }}
          />
        </label>
      </fieldset>
    </form>
  );
};

export default GenerateTableForm;
