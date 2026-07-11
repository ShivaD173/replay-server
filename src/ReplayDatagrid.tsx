import {
  Autocomplete,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import GridToolbar2 from "./GridToolbar2";
import { ReplayRow } from "./readCsv";

function MonIcon({ mon }: Readonly<{ mon: string }>) {
  const [err, setErr] = useState(false);

  let monName = mon.toLowerCase();
  if (monName.endsWith("-f")) {
    monName = monName.replace("-f", "-female");
  }
  if (monName.endsWith("-ice") || monName.endsWith("-shadow")) {
    monName = monName + "-rider";
  }

  monName = monName
    .replace(" ", "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace("hisui", "hisuian")
    .replace("galar", "galarian")
    .replace("alola", "alolan")
    .replace("paldea", "paldean");
  const src = `https://img.pokemondb.net/sprites/home/normal/${monName}.png`;
  if (err) {
    return (
      <Typography
        variant="body2"
        title={mon}
        sx={{
          width: mon.length * 5,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        fontSize={10}
      >
        {mon}
      </Typography>
    );
  }
  return (
    <img
      src={src}
      alt={mon}
      title={mon}
      style={{ width: 32, height: 32 }}
      onError={() => setErr(true)}
    />
  );
}

const columns: GridColDef[] = [
  {
    field: "date",
    headerName: "Date",
    type: "dateTime",
    flex: 8,
    valueGetter: (p) => new Date(p),
    renderCell: (params) =>
      new Date(params.value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
  },
  { field: "tier", headerName: "Tier", flex: 10, width: 100 },
  { field: "p1", headerName: "Winner", flex: 10 },
  { field: "score", headerName: "Score", flex: 5, sortable: false },
  { field: "p2", headerName: "Loser", flex: 10 },
  {
    field: "team1",
    headerName: "Winning Team",
    sortable: false,
    width: 300,
    renderCell: (params: any) => {
      const row = params.row as ReplayRow;
      const mons = row.team1.split("/");
      return (
        <Stack direction="row" spacing={1}>
          {mons.map((mon) => (
            <MonIcon key={mon} mon={mon} />
          ))}
        </Stack>
      );
    },
  },
  {
    field: "team2",
    headerName: "Losing Team",
    sortable: false,
    width: 300,
    renderCell: (params: any) => {
      const row = params.row as ReplayRow;
      const mons = row.team2.split("/");
      return (
        <Stack direction="row" spacing={1}>
          {mons.map((mon) => (
            <MonIcon key={mon} mon={mon} />
          ))}
        </Stack>
      );
    },
  },
  {
    field: "link",
    headerName: "Link",
    flex: 20,
    renderCell: (params: any) => {
      const row = params.row as ReplayRow;
      return (
        <Link href={row.link} target="_blank" rel="noopener noreferrer">
          {row.link}
        </Link>
      );
    },
  },
];

const paginationModel = { page: 0, pageSize: 20 };
const selectStyle = { fontSize: 14, width: 250 };

export function ReplayDatagrid({
  allRows,
}: Readonly<{ allRows: ReplayRow[] }>) {
  const [tier, setTier] = useState(null as string | null);
  const [player, setPlayer] = useState(null as string | null);
  const [mons, setMons] = useState(undefined as string[] | undefined);
  const allTiers = [...new Set(allRows.map((row) => row.tier))].sort((a, b) =>
    a.localeCompare(b),
  );
  const allPlayers = [
    ...new Set(allRows.map((row) => [row.p1, row.p2]).flat()),
  ].sort((a, b) => a.localeCompare(b));
  const allMons = [
    ...new Set(
      allRows
        .map((row) => [...row.team1.split("/"), ...row.team2.split("/")])
        .flat(),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const rrows = allRows.filter((row) => {
    const matchesTier = !tier || row.tier === tier;
    const matchesPlayer = !player || row.p1 === player || row.p2 === player;
    const matchesMons =
      !mons ||
      mons.every((mon) => row.team1.includes(mon) || row.team2.includes(mon));
    return matchesTier && matchesPlayer && matchesMons;
  });

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ marginLeft: 1 }}>
        <Typography variant="h6">Tier:</Typography>
        <Autocomplete
          sx={selectStyle}
          options={allTiers}
          value={tier}
          onChange={(_, val) => setTier(val)}
          size="small"
          renderInput={(params) => <TextField {...params} label="Tier" />}
        />
        <Typography variant="h6">Player:</Typography>
        <Autocomplete
          sx={selectStyle}
          options={allPlayers}
          value={player}
          onChange={(_, val) => setPlayer(val)}
          size="small"
          renderInput={(params) => <TextField {...params} label="Player" />}
        />
        <Typography variant="h6">Pokemon:</Typography>
        <Autocomplete
          multiple
          sx={selectStyle}
          options={allMons}
          value={mons}
          onChange={(_, val) => setMons(val)}
          size="small"
          renderInput={(params) => <TextField {...params} label="Pokemon" />}
        />
      </Stack>

      <DataGrid
        rows={rrows}
        columns={columns}
        getRowId={(r) => r["id"] ?? ""}
        initialState={{
          pagination: { paginationModel },
          sorting: {
            sortModel: [{ field: "date", sort: "desc" }],
          },
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        checkboxSelection
        slots={{ toolbar: GridToolbar2 }}
        density="compact"
        sx={{ border: 0 }}
        style={{ width: "100%", height: "92%" }}
      />
    </>
  );
}
