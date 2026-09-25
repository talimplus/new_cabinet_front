/**
 * The single import site for the icon package (currently `@lucide/vue`).
 *
 * Everywhere else — features and `Ui*` components — imports icons from HERE, so
 * swapping the icon library later means editing only this file. Re-exporting
 * named icons keeps tree-shaking intact (only what's used is bundled).
 *
 * Need an icon that isn't listed? Add it to the re-export below.
 */
export type { FunctionalComponent } from 'vue'

export {
  // navigation & chevrons
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight,
  Menu, MoreVertical, MoreHorizontal, ExternalLink, PanelLeft,
  // actions
  Plus, Pencil, Trash2, Copy, Download, Upload, RefreshCw, Filter, Search,
  Check, Minus, X, Save, LogOut, Settings, Eye, EyeOff, ShieldCheck,
  // status
  CheckCircle2, XCircle, AlertTriangle, Info, CircleAlert, Loader2,
  // theme & locale
  Sun, Moon, Languages,
  // domain (TalimPlus CRM)
  Users, User, UserPlus, GraduationCap, BookOpen, FileText, CalendarDays, Calendar,
  Clock, CreditCard, DollarSign, ReceiptText, Wallet, BadgeDollarSign, DoorOpen,
  Layers, ClipboardList, LayoutDashboard, Bell, Phone, Mail, Building2, MapPin,
  LocateFixed, Wifi,
  TrendingUp, TrendingDown, Flag, Coins, Settings2, Pause, Ban, CheckCheck,
  Printer, History, FileSpreadsheet, CalendarRange, Scissors, FilterX, CheckSquare,
  QrCode, Link2Off, UserCheck, ArrowLeftRight, HandCoins, Palette, ImageOff,
  // syllabus / AI / drag
  Sparkles, GripVertical, Send, MessageSquare,
} from '@lucide/vue'
